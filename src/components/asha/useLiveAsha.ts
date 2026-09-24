'use client';
// =============================================
// Live Asha — real-time voice with Gemini Live
// Streams the mic, plays Asha's voice, lets the person interrupt, records the
// check-in through silent tool calls, and runs the emergency / phrase checks in
// code on the live transcripts.
// =============================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { scanForRedFlags, checkAshaSpeech } from '@/lib/safety';
import {
  AshaState, addNote, addOtherSymptom, emptyAshaState, mergeSymptom, toolReply,
} from '@/lib/asha/slots';
import { normalizeDetail, normalizeSymptom } from '@/lib/asha/normalize';
import { startMic, MicCapture, VoicePlayer } from './audio';
import { AshaCallbacks, AshaLine, AshaSession, AshaStatus } from './types';

// The model sometimes leaks internal words into its own transcript; never show them
const TRANSCRIPT_NOISE = /\b(filter_tools|flagging|tool_code|default_api)\b/gi;

export function useLiveAsha(userId: string | undefined, roomTone: boolean, callbacks: AshaCallbacks): AshaSession {
  const [status, setStatus] = useState<AshaStatus>('idle');
  const [lines, setLines] = useState<AshaLine[]>([]);
  const [state, setState] = useState<AshaState>(emptyAshaState);
  const [level, setLevel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const micRef = useRef<MicCapture | null>(null);
  const playerRef = useRef<VoicePlayer | null>(null);
  const stateRef = useRef<AshaState>(emptyAshaState());
  const linesRef = useRef<AshaLine[]>([]);
  const flagsRef = useRef<string[]>([]);
  const personTurnRef = useRef('');
  const ashaTurnRef = useRef('');
  const endedRef = useRef(false);
  const gotAudioRef = useRef(false);
  const finishingRef = useRef(false);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const commitState = useCallback((next: AshaState) => { stateRef.current = next; setState(next); }, []);
  const commitLines = useCallback((next: AshaLine[]) => { linesRef.current = next; setLines(next); }, []);

  /** Append streamed transcript text to the current line for this speaker */
  const appendText = useCallback((who: AshaLine['who'], text: string) => {
    const clean = text.replace(TRANSCRIPT_NOISE, '');
    if (!clean) return;
    const current = linesRef.current;
    const last = current[current.length - 1];
    if (last && last.who === who && !last.final) {
      commitLines([...current.slice(0, -1), { ...last, text: last.text + clean }]);
    } else {
      commitLines([...current.map(l => ({ ...l, final: true })), { id: `${who}-${Date.now()}`, who, text: clean.trimStart(), final: false }]);
    }
  }, [commitLines]);

  const teardown = useCallback(() => {
    endedRef.current = true;
    micRef.current?.stop();
    micRef.current = null;
    try { sessionRef.current?.close(); } catch { /* already closed */ }
    sessionRef.current = null;
    playerRef.current?.close();
    playerRef.current = null;
    setLevel(0);
  }, []);

  /** Fill any gaps the live tool calls missed from the full transcript, then hand over */
  const complete = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    teardown();
    setStatus('thinking');
    let final = stateRef.current;
    try {
      const res = await fetch('/api/asha/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: linesRef.current.map(l => ({ who: l.who, text: l.text })) }),
      });
      const data = await res.json();
      if (data.success) {
        for (const s of data.symptoms ?? []) {
          // tool-call values win; extraction only fills empty fields
          const existing = final.symptoms[s.symptom as keyof typeof final.symptoms] ?? {};
          const gaps = Object.fromEntries(Object.entries(s.detail).filter(([k, v]) => v && !existing[k as keyof typeof existing]));
          final = mergeSymptom(final, s.symptom, gaps);
        }
        for (const o of data.otherSymptoms ?? []) final = addOtherSymptom(final, o);
        for (const n of data.notes ?? []) final = addNote(final, n);
      }
    } catch { /* keep what the tool calls recorded */ }
    commitState(final);
    setStatus('ended');
    callbacksRef.current.onFinished(final, linesRef.current.map(l => ({ ...l, final: true })), flagsRef.current);
  }, [teardown, commitState]);

  const escalate = useCallback((whatWasSaid: string) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    teardown();
    setStatus('ended');
    callbacksRef.current.onEmergency(whatWasSaid, stateRef.current, linesRef.current, flagsRef.current);
  }, [teardown]);

  /**
   * Language-independent checks on each completed turn (runs alongside the keyword
   * checks above): an emergency described in any language, or clinical advice from Asha.
   */
  const checkTurn = useCallback((personText: string, ashaText: string) => {
    const post = (kind: 'person' | 'asha', text: string) => fetch('/api/asha/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, text }),
    }).then(r => r.json()).catch(() => ({}));

    if (personText.trim()) {
      post('person', personText).then(r => { if (r?.emergency) escalate(personText); });
    }
    if (ashaText.trim()) {
      post('asha', ashaText).then(r => {
        if (r?.critical) {
          flagsRef.current.push(`Asha said something outside her limits (${r.critical}): "${ashaText.slice(0, 200)}" — conversation stopped for care-team review`);
          complete();
        } else if (r?.tone && !flagsRef.current.some(f => f.includes(ashaText.slice(0, 40)))) {
          flagsRef.current.push(`Tone to review (${r.tone}): "${ashaText.slice(0, 200)}"`);
        }
      });
    }
  }, [escalate, complete]);

  const handleMessage = useCallback((m: LiveServerMessage) => {
    const player = playerRef.current;
    const content = m.serverContent;

    if (content?.interrupted) {
      player?.interrupt();
      setStatus('listening');
    }

    for (const part of content?.modelTurn?.parts ?? []) {
      if (part.inlineData?.data && player) {
        gotAudioRef.current = true;
        player.enqueuePcm16(part.inlineData.data);
        setStatus('speaking');
      }
    }

    // What the person said — the emergency check runs here, in code
    if (content?.inputTranscription?.text) {
      appendText('person', content.inputTranscription.text);
      personTurnRef.current += content.inputTranscription.text;
      if (scanForRedFlags(personTurnRef.current).isEmergency) {
        escalate(personTurnRef.current);
        return;
      }
    }

    // What Asha said — checked against the playbook
    if (content?.outputTranscription?.text) {
      appendText('asha', content.outputTranscription.text);
      ashaTurnRef.current += content.outputTranscription.text;
      const check = checkAshaSpeech(ashaTurnRef.current);
      if (check.critical) {
        flagsRef.current.push(`Asha said "${check.critical}" — conversation stopped for care-team review`);
        complete();
        return;
      }
      if (check.tone && !flagsRef.current.some(f => f.includes(check.tone!))) {
        flagsRef.current.push(`Tone to review: "${check.tone}"`);
      }
    }

    if (content?.turnComplete) {
      const personText = personTurnRef.current;
      const ashaText = ashaTurnRef.current;
      personTurnRef.current = '';
      ashaTurnRef.current = '';
      checkTurn(personText, ashaText);
      commitLines(linesRef.current.map(l => ({ ...l, final: true })));
      if (finishingRef.current) return;
      setStatus(player?.isPlaying ? 'speaking' : 'listening');
    }

    // Silent paperwork
    for (const call of m.toolCall?.functionCalls ?? []) {
      const args = (call.args ?? {}) as Record<string, unknown>;
      let response: Record<string, unknown> = { recorded: true };

      if (call.name === 'save_symptom') {
        const name = normalizeSymptom(args.symptom);
        if (name) {
          commitState(mergeSymptom(stateRef.current, name, normalizeDetail(args)));
          response = toolReply(stateRef.current, name);
        } else {
          response = { recorded: false, guidance: 'Use the closest listed symptom, or other_symptom.' };
        }
      } else if (call.name === 'other_symptom' && typeof args.description === 'string') {
        commitState(addOtherSymptom(stateRef.current, args.description));
        response = toolReply(stateRef.current);
      } else if (call.name === 'save_note' && typeof args.text === 'string') {
        commitState(addNote(stateRef.current, args.text));
        response = toolReply(stateRef.current);
      } else if (call.name === 'flag_emergency') {
        escalate(typeof args.what_they_said === 'string' ? args.what_they_said : personTurnRef.current);
        return;
      } else if (call.name === 'finish_check_in') {
        // Let Asha finish her goodbye, then wrap up
        const waitForGoodbye = () => {
          if (playerRef.current?.isPlaying) setTimeout(waitForGoodbye, 300);
          else complete();
        };
        setTimeout(waitForGoodbye, 1200);
      }

      sessionRef.current?.sendToolResponse({
        functionResponses: [{ id: call.id, name: call.name, response }],
      });
    }
  }, [complete, escalate, appendText, commitLines, commitState, checkTurn]);

  const connect = useCallback(async (attempt: number): Promise<void> => {
    const res = await fetch('/api/asha/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, attempt }),
    });
    const t = await res.json();
    if (!t.success) throw new Error(t.error || 'Could not reach Asha');

    const ai = new GoogleGenAI({ apiKey: t.token, httpOptions: { apiVersion: 'v1alpha' } });
    gotAudioRef.current = false;
    sessionRef.current = await ai.live.connect({
      model: t.model,
      config: { responseModalities: [Modality.AUDIO] },
      callbacks: {
        onmessage: handleMessage,
        onerror: () => setError('The connection to Asha dropped.'),
        onclose: (e: CloseEvent) => {
          if (endedRef.current || finishingRef.current) return;
          // The first model refused the session before speaking: try the fallback once
          if (!gotAudioRef.current && t.hasFallback) {
            connect(attempt + 1).catch(err => { setError(err.message); setStatus('error'); teardown(); });
            return;
          }
          if (e.code !== 1000 && linesRef.current.length === 0) {
            setError('Asha could not start. You can switch to typing instead.');
            setStatus('error');
            teardown();
            return;
          }
          complete();
        },
      },
    });
    // Asha speaks first
    sessionRef.current.sendRealtimeInput({ text: 'Hello' });
  }, [userId, handleMessage, complete, teardown]);

  const start = useCallback(async () => {
    if (!userId) return;
    setError(null);
    setStatus('connecting');
    endedRef.current = false;
    finishingRef.current = false;
    flagsRef.current = [];
    commitLines([]);
    commitState(emptyAshaState());
    try {
      const player = new VoicePlayer();
      await player.resume();
      player.setRoomTone(roomTone);
      playerRef.current = player;

      micRef.current = await startMic(
        chunk => sessionRef.current?.sendRealtimeInput({ audio: { data: chunk, mimeType: 'audio/pcm;rate=16000' } }),
        setLevel,
      );
      await connect(0);
    } catch (err) {
      teardown();
      const denied = err instanceof DOMException && err.name === 'NotAllowedError';
      setError(denied
        ? 'Microphone access was blocked. Allow it in your browser settings, or switch to typing.'
        : err instanceof Error ? err.message : 'Asha could not start.');
      setStatus('error');
    }
  }, [userId, roomTone, connect, teardown, commitLines, commitState]);

  /** Stop without finishing — used when switching modes. Nothing is submitted. */
  const cancel = useCallback(() => {
    finishingRef.current = true;
    teardown();
    personTurnRef.current = '';
    ashaTurnRef.current = '';
    commitLines([]);
    commitState(emptyAshaState());
    setError(null);
    setStatus('idle');
  }, [teardown, commitLines, commitState]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      micRef.current?.setMuted(!m);
      return !m;
    });
  }, []);

  // Back to "listening" once Asha's voice has finished playing
  useEffect(() => {
    if (status !== 'speaking') return;
    const id = setInterval(() => {
      if (!playerRef.current?.isPlaying) setStatus(s => (s === 'speaking' ? 'listening' : s));
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => { playerRef.current?.setRoomTone(roomTone); }, [roomTone]);
  useEffect(() => () => teardown(), [teardown]);

  return {
    status,
    lines,
    state,
    level,
    muted,
    error,
    start,
    finish: complete,
    cancel,
    toggleMute,
  };
}
