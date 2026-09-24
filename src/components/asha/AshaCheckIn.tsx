'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Keyboard, Radio, Volume2, VolumeX, LoaderCircle } from 'lucide-react';
import { AshaState, DETAIL_FIELDS, labelFor } from '@/lib/asha/slots';
import { useLiveAsha } from './useLiveAsha';
import { useTapAsha } from './useTapAsha';
import { AshaCallbacks, AshaLine, AshaStatus } from './types';

const STATUS_TEXT: Record<AshaStatus, string> = {
  idle: 'Ready when you are',
  connecting: 'Connecting…',
  listening: 'Listening',
  thinking: 'One moment…',
  speaking: 'Asha is speaking — you can talk over her any time',
  ended: 'Conversation finished',
  error: 'Something went wrong',
};

const DETAIL_TEXT: Record<string, Record<string, string>> = {
  severity: { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' },
  frequency: { occasional: 'Now and then', frequent: 'Often', constant: 'All the time' },
  trend: { improving: 'Getting better', stable: 'About the same', worsening: 'Getting worse' },
  duration: { '1-2 days': '1–2 days', '3-5 days': '3–5 days', '1 week': 'About 1 week', '2 weeks': 'About 2 weeks', '3 weeks': 'About 3 weeks', '1 month+': 'A month or more' },
};

function AshaMark({ speaking }: { speaking: boolean }) {
  return (
    <span
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-display text-lg transition-colors duration-150 ${
        speaking ? 'bg-primary-600 text-white dark:bg-primary-300 dark:text-surface-950' : 'bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-200'
      }`}
      aria-hidden="true"
    >
      A
    </span>
  );
}

/** Five bars driven only by the real microphone level — no decorative looping animation */
function LevelMeter({ level, active }: { level: number; active: boolean }) {
  return (
    <span className="flex items-end gap-0.5 h-5" aria-hidden="true">
      {[0.15, 0.35, 0.55, 0.35, 0.15].map((w, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm transition-[height] duration-100 ${active ? 'bg-primary-600 dark:bg-primary-300' : 'bg-[var(--plane-strong)]'}`}
          style={{ height: `${Math.max(4, Math.min(20, 4 + level * 40 * (1 - Math.abs(w - 0.55))))}px` }}
        />
      ))}
    </span>
  );
}

function Transcript({ lines, pending }: { lines: AshaLine[]; pending: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [lines, pending]);
  return (
    <div className="space-y-4" aria-live="polite">
      {lines.map(line => (
        line.who === 'asha' ? (
          <p key={line.id} className={`max-w-[85%] text-foreground leading-relaxed ${line.final ? '' : 'opacity-80'}`}>
            {line.text}
          </p>
        ) : (
          <div key={line.id} className="flex justify-end">
            <p className={`max-w-[80%] px-4 py-2.5 rounded-xl rounded-br bg-plane text-foreground ${line.final ? '' : 'opacity-80'}`}>
              {line.text}
            </p>
          </div>
        )
      ))}
      {pending && (
        <div className="space-y-2 max-w-sm" aria-label="Asha is thinking">
          <div className="skeleton h-3 w-11/12" />
          <div className="skeleton h-3 w-2/3" />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function Noted({ state }: { state: AshaState }) {
  const empty = state.order.length === 0 && state.otherSymptoms.length === 0 && state.notes.length === 0;
  return (
    <aside className="panel p-5" aria-labelledby="noted">
      <h2 id="noted" className="section-title !font-sans mb-1">What Asha has noted</h2>
      <p className="text-xs text-subtle mb-4">You can check and change all of this before it is sent.</p>
      {empty ? (
        <p className="text-sm text-muted">Nothing yet. As you talk, what you tell Asha appears here.</p>
      ) : (
        <ul className="space-y-4">
          {state.order.map(name => {
            const d = state.symptoms[name] ?? {};
            const known = DETAIL_FIELDS.filter(f => d[f]);
            return (
              <li key={name}>
                <p className="text-sm font-medium text-foreground">{labelFor(name)}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {known.length === 0 && <span className="text-xs text-subtle">No details yet</span>}
                  {known.map(f => (
                    <span key={f} className="text-xs px-1.5 py-0.5 rounded bg-[var(--card-bg)] text-muted">
                      {DETAIL_TEXT[f][d[f] as string] ?? d[f]}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
          {state.otherSymptoms.length > 0 && (
            <li>
              <p className="text-sm font-medium text-foreground">Also mentioned</p>
              <p className="text-sm text-muted mt-0.5">{state.otherSymptoms.join(', ')}</p>
            </li>
          )}
          {state.notes.length > 0 && (
            <li>
              <p className="text-sm font-medium text-foreground">For your care team</p>
              <ul className="mt-0.5 space-y-1">
                {state.notes.map(n => <li key={n} className="text-sm text-muted">{n}</li>)}
              </ul>
            </li>
          )}
        </ul>
      )}
    </aside>
  );
}

export function AshaCheckIn({
  userId, isCaregiver, patientFirstName, callbacks, onUseForm,
}: {
  userId: string;
  isCaregiver: boolean;
  patientFirstName: string;
  callbacks: AshaCallbacks;
  onUseForm: () => void;
}) {
  const [mode, setMode] = useState<'live' | 'tap'>('live');
  const [roomTone, setRoomTone] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [draft, setDraft] = useState('');

  const live = useLiveAsha(mode === 'live' ? userId : undefined, roomTone, callbacks);
  const tap = useTapAsha(mode === 'tap' ? userId : undefined, speakReplies, callbacks);

  const active = mode === 'live' ? live : tap;
  const status = active.status;
  const started = status !== 'idle' && status !== 'error';
  const inConversation = started && status !== 'ended';

  const switchMode = (next: 'live' | 'tap') => {
    if (mode === 'live' && inConversation) live.finish();
    setMode(next);
  };

  const sendDraft = async () => {
    if (!draft.trim() || tap.status === 'thinking') return;
    const text = draft;
    setDraft('');
    if (!(await tap.send(text))) setDraft(text); // Asha was still replying — keep what they wrote
  };

  return (
    <div className="grid lg:grid-cols-[1fr_18rem] gap-6 items-start">
      <section className="card flex flex-col min-h-[28rem]" aria-labelledby="asha-title">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[var(--card-border)]">
          <AshaMark speaking={status === 'speaking'} />
          <div className="flex-1 min-w-0">
            <p id="asha-title" className="font-semibold text-foreground">Asha</p>
            <p className="text-sm text-muted flex items-center gap-2" role="status">
              {mode === 'live' && status === 'listening' && <LevelMeter level={live.muted ? 0 : live.level} active={!live.muted} />}
              {(status === 'connecting' || status === 'thinking') && <LoaderCircle className="w-3.5 h-3.5 animate-spin" />}
              <span className="truncate">{mode === 'live' && live.muted && inConversation ? 'Your microphone is muted' : STATUS_TEXT[status]}</span>
            </p>
          </div>
          <button
            onClick={() => switchMode(mode === 'live' ? 'tap' : 'live')}
            className="btn-ghost !min-h-[36px] text-sm"
          >
            {mode === 'live' ? <><Keyboard className="w-4 h-4" /> Type instead</> : <><Radio className="w-4 h-4" /> Talk live</>}
          </button>
        </header>

        {/* Conversation */}
        <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[26rem]">
          {!started ? (
            <div className="max-w-md">
              <p className="font-display text-2xl text-foreground">
                {isCaregiver ? `Tell Asha how ${patientFirstName} has been` : 'Tell Asha how you have been'}
              </p>
              <p className="text-muted mt-3">
                Asha will ask a few gentle questions and pass everything on to {isCaregiver ? `${patientFirstName}'s` : 'your'} care team.
                Speak in Hindi, English or any Indian language. It takes about three to five minutes, and you can stop whenever you like.
              </p>
              {active.error && <p className="text-sm text-emergency-700 dark:text-emergency-300 mt-4" role="alert">{active.error}</p>}
              <div className="flex flex-wrap gap-2 mt-6">
                <button onClick={() => active.start()} className="btn-primary !min-h-[48px] !px-5">
                  {mode === 'live' ? <><Mic className="w-4 h-4" /> Start talking with Asha</> : <><Send className="w-4 h-4" /> Start with Asha</>}
                </button>
                <button onClick={onUseForm} className="btn-ghost">Choose from a list instead</button>
              </div>
              {mode === 'live' && (
                <p className="text-xs text-subtle mt-4">Your browser will ask to use the microphone. Asha listens only while this conversation is open.</p>
              )}
            </div>
          ) : (
            <Transcript lines={active.lines} pending={status === 'thinking' || status === 'connecting'} />
          )}
          {started && active.error && <p className="text-sm text-emergency-700 dark:text-emergency-300 mt-4" role="alert">{active.error}</p>}
        </div>

        {/* Controls */}
        {inConversation && (
          <footer className="px-6 py-4 border-t border-[var(--card-border)]">
            {mode === 'live' ? (
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={live.toggleMute} className="btn-secondary" aria-pressed={live.muted}>
                  {live.muted ? <><Mic className="w-4 h-4" /> Unmute</> : <><MicOff className="w-4 h-4" /> Mute</>}
                </button>
                <button onClick={live.finish} className="btn-ghost">That&apos;s enough for now</button>
                <label className="ml-auto flex items-center gap-2 text-xs text-subtle cursor-pointer select-none">
                  <input type="checkbox" checked={roomTone} onChange={e => setRoomTone(e.target.checked)} className="accent-primary-600" />
                  Soft room sound
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <button
                    onClick={tap.toggleRecording}
                    aria-label={tap.recording ? 'Stop and send' : 'Record a reply'}
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                      tap.recording ? 'bg-emergency-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-300 dark:text-surface-950'
                    }`}
                  >
                    {tap.recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <label className="sr-only" htmlFor="asha-draft">Your reply</label>
                  <textarea
                    id="asha-draft"
                    rows={1}
                    className="input-field resize-none"
                    placeholder={tap.recording ? 'Listening… tap the red button to send' : 'Type your reply, or tap the microphone'}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDraft(); } }}
                    disabled={tap.recording}
                  />
                  <button onClick={sendDraft} disabled={!draft.trim() || status === 'thinking'} className="btn-primary !px-3 disabled:opacity-40" aria-label="Send">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={tap.finish} className="btn-ghost !min-h-[36px] text-sm">That&apos;s enough for now</button>
                  <button onClick={() => setSpeakReplies(v => !v)} className="btn-ghost !min-h-[36px] text-sm ml-auto" aria-pressed={speakReplies}>
                    {speakReplies ? <><Volume2 className="w-4 h-4" /> Asha speaks her replies</> : <><VolumeX className="w-4 h-4" /> Replies are silent</>}
                  </button>
                </div>
              </div>
            )}
          </footer>
        )}

        <p className="px-6 pb-5 pt-1 text-xs text-subtle">
          Asha is an AI companion, not a doctor. Your care team reads everything you share.
        </p>
      </section>

      <Noted state={active.state} />
    </div>
  );
}
