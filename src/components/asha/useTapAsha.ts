'use client';
// =============================================
// Asha, tap to talk — the fallback and typing mode
// Type or hold-to-record (Sarvam, kept in the spoken language); Asha replies in
// text and speaks with Sarvam's Bulbul voice. Tapping the mic stops her speaking.
// =============================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { AshaState, addNote, addOtherSymptom, emptyAshaState, mergeSymptom } from '@/lib/asha/slots';
import { AshaFlow, emptyFlow } from '@/lib/asha/flow';
import { AshaCallbacks, AshaLine, AshaStatus } from './types';

type Turn = { role: 'user' | 'assistant'; content: string };

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t));
}

export function useTapAsha(userId: string | undefined, speakReplies: boolean, callbacks: AshaCallbacks) {
  const [status, setStatus] = useState<AshaStatus>('idle');
  const [lines, setLines] = useState<AshaLine[]>([]);
  const [state, setState] = useState<AshaState>(emptyAshaState);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<Turn[]>([]);
  const stateRef = useRef<AshaState>(emptyAshaState());
  const flowRef = useRef<AshaFlow>(emptyFlow());
  const linesRef = useRef<AshaLine[]>([]);
  const flagsRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const busyRef = useRef(false);
  const cancelledRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const pushLine = (who: AshaLine['who'], text: string) => {
    linesRef.current = [...linesRef.current, { id: `${who}-${Date.now()}-${linesRef.current.length}`, who, text, final: true }];
    setLines(linesRef.current);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const speak = useCallback(async (text: string, language: string) => {
    if (!speakReplies) return;
    try {
      const res = await fetch('/api/asha/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      stopSpeaking();
      const audio = new Audio(url);
      audioRef.current = audio;
      setStatus('speaking');
      audio.onended = () => { URL.revokeObjectURL(url); if (audioRef.current === audio) { audioRef.current = null; setStatus(s => (s === 'speaking' ? 'listening' : s)); } };
      await audio.play();
    } catch { /* text is on screen even if the voice fails */ }
  }, [speakReplies]);

  /** Fill gaps from the whole conversation, then hand over */
  const complete = useCallback(async () => {
    stopSpeaking();
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
          const existing = final.symptoms[s.symptom as keyof typeof final.symptoms] ?? {};
          const gaps = Object.fromEntries(Object.entries(s.detail).filter(([k, v]) => v && !existing[k as keyof typeof existing]));
          final = mergeSymptom(final, s.symptom, gaps);
        }
        for (const o of data.otherSymptoms ?? []) final = addOtherSymptom(final, o);
        for (const n of data.notes ?? []) final = addNote(final, n);
      }
    } catch { /* keep what was recorded turn by turn */ }
    stateRef.current = final;
    setState(final);
    setStatus('ended');
    callbacksRef.current.onFinished(final, linesRef.current, flagsRef.current);
  }, []);

  /** Returns false if Asha is still replying, so the caller can keep the draft */
  const send = useCallback(async (text: string, { hidden = false } = {}): Promise<boolean> => {
    const trimmed = text.trim();
    if (!trimmed || !userId || busyRef.current) return false;
    busyRef.current = true;
    stopSpeaking();
    if (!hidden) pushLine('person', trimmed);
    messagesRef.current = [...messagesRef.current, { role: 'user', content: trimmed }];
    setStatus('thinking');
    setError(null);
    try {
      const res = await fetch('/api/asha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messages: messagesRef.current, state: stateRef.current, flow: flowRef.current }),
      });
      const data = await res.json();
      if (cancelledRef.current) return true; // switched away while Asha was replying
      if (!data.success) throw new Error(data.error || 'Asha could not reply');
      if (data.emergency) {
        setStatus('ended');
        callbacksRef.current.onEmergency(data.trigger, stateRef.current, linesRef.current, flagsRef.current);
        return true;
      }
      stateRef.current = data.state;
      setState(data.state);
      flowRef.current = data.flow;
      if (data.reviewFlag) flagsRef.current.push(data.reviewFlag);
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: data.reply }];
      pushLine('asha', data.reply);
      setStatus('listening');
      busyRef.current = false;
      await speak(data.reply, data.language);
      if (data.done) {
        // Let the goodbye finish before handing over
        const wait = () => (audioRef.current ? setTimeout(wait, 300) : complete());
        setTimeout(wait, 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Asha could not reply');
      setStatus('listening');
    } finally {
      busyRef.current = false;
    }
    return true;
  }, [userId, speak, complete]);

  const start = useCallback(async () => {
    cancelledRef.current = false;
    messagesRef.current = [];
    stateRef.current = emptyAshaState();
    flowRef.current = emptyFlow();
    linesRef.current = [];
    flagsRef.current = [];
    setLines([]);
    setState(emptyAshaState());
    await send('Hello', { hidden: true });
  }, [send]);

  /** Tap once to talk, tap again to send. Tapping also stops Asha mid-sentence. */
  const toggleRecording = useCallback(async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    stopSpeaking();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
        if (cancelledRef.current) return; // switched modes mid-recording: discard
        const type = recorder.mimeType.split(';')[0] || 'audio/webm';
        const blob = new Blob(chunks, { type });
        if (!blob.size) return;
        setStatus('thinking');
        const form = new FormData();
        form.append('file', blob, `asha.${type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'}`);
        form.append('mode', 'transcribe');
        try {
          const r = await fetch('/api/transcribe', { method: 'POST', body: form });
          const d = await r.json();
          if (!d.success || !d.transcript) throw new Error(d.error || 'I could not hear that. Please try again.');
          if (!(await send(d.transcript))) setError('Asha was still replying — please say that again.');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'I could not hear that.');
          setStatus('listening');
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setStatus('listening');
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 28_000);
    } catch (err) {
      const denied = err instanceof DOMException && err.name === 'NotAllowedError';
      setError(denied ? 'Microphone access was blocked. You can type instead.' : 'Could not start the microphone. You can type instead.');
    }
  }, [recording, send]);

  /** Stop without submitting — used when switching modes */
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    busyRef.current = false;
    stopSpeaking();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    messagesRef.current = [];
    stateRef.current = emptyAshaState();
    flowRef.current = emptyFlow();
    linesRef.current = [];
    flagsRef.current = [];
    setLines([]);
    setState(emptyAshaState());
    setRecording(false);
    setError(null);
    setStatus('idle');
  }, []);

  useEffect(() => () => {
    stopSpeaking();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  return { status, lines, state, recording, error, start, send, toggleRecording, finish: complete, cancel };
}
