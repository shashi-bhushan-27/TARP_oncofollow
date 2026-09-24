'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ChevronRight, ChevronLeft, Mic, MicOff, Check,
  Phone, Shield, ClipboardList, LoaderCircle,
  Languages, Paperclip, UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  SYMPTOM_DEFINITIONS, SymptomEntry, SymptomName, Severity, Frequency, Trend, TriageResult
} from '@/types';
import { getPatientForUser } from '@/data/demoData';
import { runTriage } from '@/lib/triage';
import { scanForRedFlags, scanSymptomsForRedFlags } from '@/lib/safety';
import { RoutingChip } from '@/components/RoutingChip';
import { AshaCheckIn } from '@/components/asha/AshaCheckIn';
import { AshaSummary } from '@/components/asha/AshaSummary';
import { AshaLine } from '@/components/asha/types';
import { AshaState, toCheckInForm } from '@/lib/asha/slots';

// Sarvam's REST speech-to-text-translate endpoint accepts clips under 30 seconds
const MAX_RECORDING_MS = 28_000;

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
    .find(type => MediaRecorder.isTypeSupported(type));
}

export default function SymptomsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const patient = getPatientForUser(user);
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<SymptomName>>(new Set());
  const [symptomDetails, setSymptomDetails] = useState<Record<SymptomName, Partial<SymptomEntry>>>({} as Record<SymptomName, Partial<SymptomEntry>>);
  const [freeText, setFreeText] = useState('');
  const [associatedSymptoms, setAssociatedSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  // "Talk it through" with Asha is the default; the list-based form is the alternative
  const [mode, setMode] = useState<'asha' | 'form'>('asha');
  const [ashaResult, setAshaResult] = useState<{ state: AshaState; lines: AshaLine[]; flags: string[] } | null>(null);
  const [ashaAttempt, setAshaAttempt] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const releaseMicrophone = () => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  // Stop the mic if the patient leaves the page mid-recording
  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.onstop = null;
      recorder.stop();
    }
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const toggleSymptom = (name: SymptomName) => {
    setSelectedSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const updateDetail = (name: SymptomName, field: string, value: string) => {
    setSymptomDetails(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: value },
    }));
  };

  const transcribe = async (audio: Blob) => {
    setIsTranscribing(true);
    try {
      const extension = audio.type.includes('mp4') ? 'm4a' : audio.type.includes('ogg') ? 'ogg' : 'webm';
      const form = new FormData();
      form.append('file', audio, `voice-note.${extension}`);

      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Transcription failed');
      if (!data.transcript) throw new Error('We could not hear anything in that recording. Please try again closer to the microphone.');

      setTranscript(prev => (prev ? `${prev} ${data.transcript}` : data.transcript));
      setDetectedLanguage(data.languageCode);
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Transcription failed. Please try again or type instead.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setVoiceError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError('Voice recording is not supported in this browser. Please type your symptoms instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        releaseMicrophone();
        setIsRecording(false);
        // Sarvam accepts "audio/webm" but rejects "audio/webm;codecs=opus", so drop the codec part
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType.split(';')[0] || 'audio/webm' });
        chunksRef.current = [];
        if (audio.size > 0) transcribe(audio);
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      autoStopRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (err) {
      releaseMicrophone();
      const denied = err instanceof DOMException && err.name === 'NotAllowedError';
      setVoiceError(denied
        ? 'Microphone access was blocked. Please allow microphone access in your browser settings, or type instead.'
        : 'Could not start the microphone. Please check it is connected, or type instead.');
    }
  };

  const handleVoiceToggle = () => {
    if (isTranscribing) return;
    if (isRecording) recorderRef.current?.stop();
    else startRecording();
  };

  const submitCheckIn = (input = {
    selected: selectedSymptoms,
    details: symptomDetails,
    free: freeText,
    associated: associatedSymptoms,
    spoken: transcript,
  }) => {
    if (!patient) return;

    const symptoms: SymptomEntry[] = Array.from(input.selected).map(name => {
      const def = SYMPTOM_DEFINITIONS.find(d => d.name === name);
      const details = input.details[name] || {};
      return {
        name,
        label: def?.label || name,
        severity: (details.severity as Severity) || 'moderate',
        duration: (details.duration as string) || '1 week',
        frequency: (details.frequency as Frequency) || 'frequent',
        trend: (details.trend as Trend) || 'stable',
      };
    });

    const allText = `${input.free} ${input.associated} ${input.spoken}`;

    // Check for emergency red flags first
    const textFlags = scanForRedFlags(allText);
    const symptomFlags = scanSymptomsForRedFlags(symptoms);

    if (textFlags.isEmergency || symptomFlags.isEmergency) {
      setShowEmergency(true);
    }

    // Run triage
    const result = runTriage({
      symptoms,
      freeText: [input.free, input.spoken].filter(Boolean).join(' '),
      associatedSymptoms: input.associated,
      patient,
      recentDocuments: [],
    });

    setTriageResult(result);
    setStep(4); // Show results
  };

  const handleSubmit = () => submitCheckIn();

  // Asha's findings go through exactly the same submit and routing as the form
  const submitFromAsha = (state: AshaState, lines: AshaLine[], extraText = '') => {
    const form = toCheckInForm(state);
    setSelectedSymptoms(form.selected);
    setSymptomDetails(form.details);
    submitCheckIn({
      selected: form.selected,
      details: form.details,
      free: [form.notes, extraText].filter(Boolean).join(' '),
      associated: form.associated,
      spoken: lines.filter(l => l.who === 'person').map(l => l.text).join(' '),
    });
  };

  const ashaCallbacks = {
    onFinished: (state: AshaState, lines: AshaLine[], flags: string[]) => setAshaResult({ state, lines, flags }),
    onEmergency: (said: string, state: AshaState, lines: AshaLine[]) => {
      submitFromAsha(state, lines, said);
      setShowEmergency(true);
    },
  };
  const isCaregiver = user?.role === 'caregiver';
  const patientFirstName = patient?.user.name.split(' ')[0] ?? '';

  // Emergency Overlay
  if (showEmergency) {
    return (
      <div className="emergency-overlay animate-fade-in" role="alertdialog" aria-labelledby="emergency-title">
        <div className="max-w-lg w-full mx-auto p-6 sm:p-8 text-white">
          <span className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center mb-6">
            <Phone className="w-6 h-6" />
          </span>
          <h1 id="emergency-title" className="font-display text-3xl sm:text-4xl mb-4">Please get help now</h1>
          <p className="text-lg text-emergency-50 leading-relaxed mb-6">
            Your check-in mentions something on our emergency list, so we have <strong className="font-semibold text-white">paged the on-call oncology coordinator</strong>.
            Don&apos;t wait for their call.
          </p>
          <ol className="space-y-3 mb-8">
            {[
              'Call your local emergency number',
              'Or go to the nearest emergency department',
              'Bring your cancer treatment records if you can',
              'Tell the emergency team about your cancer treatment',
            ].map((item, i) => (
              <li key={item} className="flex gap-3 items-baseline">
                <span className="w-6 h-6 rounded bg-white/15 text-sm font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ol>
          <button
            onClick={() => setShowEmergency(false)}
            className="w-full min-h-touch rounded-lg bg-white text-emergency-800 font-semibold hover:bg-emergency-50 transition-colors"
          >
            I understand — show what was sent
          </button>
          <p className="text-emergency-100 text-xs mt-6">
            OncoFollow supports follow-up care and does not replace your doctor.
          </p>
        </div>
      </div>
    );
  }

  const steps = ['What you noticed', 'A few details', 'In your own words'];

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <p className="eyebrow mb-2">{step < 4 ? 'Check-in' : 'Check-in sent'}</p>
        <h1 className="page-title">
          {step < 4 ? 'Tell your care team how you are' : 'Your care team has your check-in'}
        </h1>
      </header>

      {/* Stepper (list-based form) */}
      {step < 4 && mode === 'form' && (
        <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
          {steps.map((label, i) => {
            const n = i + 1;
            const state = n < step ? 'done' : n === step ? 'current' : 'todo';
            return (
              <li key={label} aria-current={state === 'current' ? 'step' : undefined}>
                <div className={`h-1 rounded-sm mb-2 ${state === 'todo' ? 'bg-plane' : 'bg-primary-600 dark:bg-primary-300'}`} />
                <p className={`text-xs ${state === 'current' ? 'text-foreground font-semibold' : 'text-subtle'}`}>
                  <span className="tabular-nums">{n}.</span> {label}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {/* Step 1 (default): talk it through with Asha */}
      {step === 1 && mode === 'asha' && user && (
        ashaResult ? (
          <AshaSummary
            state={ashaResult.state}
            lines={ashaResult.lines}
            onChange={state => setAshaResult({ ...ashaResult, state })}
            onConfirm={() => submitFromAsha(ashaResult.state, ashaResult.lines)}
            onTalkAgain={() => { setAshaResult(null); setAshaAttempt(n => n + 1); }}
            isCaregiver={isCaregiver}
            patientFirstName={patientFirstName}
          />
        ) : (
          <AshaCheckIn
            key={ashaAttempt}
            userId={user.id}
            isCaregiver={isCaregiver}
            patientFirstName={patientFirstName}
            callbacks={ashaCallbacks}
            onUseForm={() => setMode('form')}
          />
        )
      )}

      {/* Step 1: Select Symptoms */}
      {step === 1 && mode === 'form' && (
        <div className="space-y-6">
          <button onClick={() => setMode('asha')} className="btn-ghost -ml-3">
            <ChevronLeft className="w-4 h-4" /> Talk it through with Asha instead
          </button>
          <section className="card p-6 sm:p-8" aria-labelledby="pick">
            <h2 id="pick" className="section-title !font-sans">What have you noticed?</h2>
            <p className="text-sm text-muted mt-1 mb-5">Choose everything that applies. You can also describe it by voice below.</p>

            <div className="grid sm:grid-cols-2 gap-2">
              {SYMPTOM_DEFINITIONS.map(def => {
                const selected = selectedSymptoms.has(def.name);
                return (
                  <button
                    key={def.name}
                    onClick={() => toggleSymptom(def.name)}
                    aria-pressed={selected}
                    className={`flex items-start gap-3 p-3 rounded-lg text-left min-h-touch transition-colors duration-150 ${
                      selected
                        ? def.isRedFlag
                          ? 'bg-emergency-50 dark:bg-emergency-950 ring-1 ring-emergency-600 dark:ring-emergency-400'
                          : 'bg-primary-50 dark:bg-primary-950 ring-1 ring-primary-600 dark:ring-primary-300'
                        : 'bg-plane hover:bg-[var(--plane-strong)]'
                    }`}
                    id={`symptom-${def.name}`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        selected
                          ? def.isRedFlag ? 'bg-emergency-600 text-white' : 'bg-primary-600 text-white dark:bg-primary-300 dark:text-surface-950'
                          : 'bg-[var(--card-bg)] ring-1 ring-[var(--input-border)]'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{def.label}</span>
                      <span className="block text-xs text-muted mt-0.5">{def.description}</span>
                      {def.isRedFlag && selected && (
                        <span className="block text-xs font-medium text-emergency-700 dark:text-emergency-300 mt-1">
                          This alerts the on-call team straight away
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Voice Recording */}
          <section className="card p-6 sm:p-8" aria-labelledby="voice">
            <h2 id="voice" className="section-title !font-sans">Or say it in your own words</h2>
            <p className="text-sm text-muted mt-1 mb-5 flex items-center gap-1.5">
              <Languages className="w-4 h-4 flex-shrink-0" />
              Hindi, English or any major Indian language · up to 30 seconds per note
            </p>
            <div className="flex items-start gap-4">
              <button
                onClick={handleVoiceToggle}
                disabled={isTranscribing}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150 disabled:opacity-60 ${
                  isRecording
                    ? 'bg-emergency-600 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-300 dark:text-surface-950'
                }`}
              >
                {isTranscribing ? <LoaderCircle className="w-6 h-6 animate-spin" />
                  : isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <div className="flex-1 min-w-0 pt-1" aria-live="polite">
                {isRecording ? (
                  <p className="text-sm font-medium text-emergency-700 dark:text-emergency-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emergency-600" aria-hidden="true" />
                    Recording — tap the button again to stop
                  </p>
                ) : isTranscribing ? (
                  <div className="space-y-2" aria-label="Transcribing">
                    <p className="text-sm text-muted">Turning your voice note into English text…</p>
                    <div className="skeleton h-3 w-4/5" />
                    <div className="skeleton h-3 w-3/5" />
                  </div>
                ) : transcript ? (
                  <div className="p-4 rounded-lg bg-plane">
                    <p className="text-sm text-foreground">{transcript}</p>
                    <p className="text-xs text-subtle mt-2">
                      English transcript{detectedLanguage ? ` · spoken in ${detectedLanguage}` : ''} · you can edit it in step 3, or record again to add more
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Tap the microphone and speak. Tap again when you are done.</p>
                )}
                {voiceError && (
                  <p className="text-sm text-emergency-700 dark:text-emergency-300 mt-2" role="alert">{voiceError}</p>
                )}
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-subtle" aria-live="polite">
              {selectedSymptoms.size > 0 ? `${selectedSymptoms.size} selected` : transcript ? 'Voice note added' : 'Nothing selected yet'}
            </p>
            <button
              onClick={() => setStep(2)}
              disabled={(selectedSymptoms.size === 0 && !transcript) || isRecording || isTranscribing}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          <section className="card" aria-labelledby="details">
            <div className="p-6 sm:px-8 sm:pt-8 sm:pb-2">
              <h2 id="details" className="section-title !font-sans">A few details about each one</h2>
              <p className="text-sm text-muted mt-1">If you are not sure, leave it — your care team will ask.</p>
            </div>
            {selectedSymptoms.size === 0 && (
              <p className="px-6 sm:px-8 pb-8 pt-4 text-sm text-muted">You described things by voice, so there is nothing to add here. Continue to the next step.</p>
            )}
            <div className="divide-y divide-[var(--card-border)]">
              {Array.from(selectedSymptoms).map(name => {
                const def = SYMPTOM_DEFINITIONS.find(d => d.name === name);
                const details = symptomDetails[name] || {};
                return (
                  <fieldset key={name} className="p-6 sm:px-8">
                    <legend className="sr-only">{def?.label}</legend>
                    <p className="font-medium text-foreground mb-4" aria-hidden="true">{def?.label}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor={`${name}-severity`}>How strong is it?</label>
                        <select
                          id={`${name}-severity`}
                          className="input-field"
                          value={details.severity || ''}
                          onChange={e => updateDetail(name, 'severity', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>
                      <div>
                        <label className="label" htmlFor={`${name}-duration`}>For how long?</label>
                        <select
                          id={`${name}-duration`}
                          className="input-field"
                          value={details.duration || ''}
                          onChange={e => updateDetail(name, 'duration', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="1-2 days">1–2 days</option>
                          <option value="3-5 days">3–5 days</option>
                          <option value="1 week">About 1 week</option>
                          <option value="2 weeks">About 2 weeks</option>
                          <option value="3 weeks">About 3 weeks</option>
                          <option value="1 month+">A month or more</option>
                        </select>
                      </div>
                      <div>
                        <label className="label" htmlFor={`${name}-frequency`}>How often?</label>
                        <select
                          id={`${name}-frequency`}
                          className="input-field"
                          value={details.frequency || ''}
                          onChange={e => updateDetail(name, 'frequency', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="occasional">Now and then</option>
                          <option value="frequent">Often</option>
                          <option value="constant">All the time</option>
                        </select>
                      </div>
                      <div>
                        <label className="label" htmlFor={`${name}-trend`}>Getting better or worse?</label>
                        <select
                          id={`${name}-trend`}
                          className="input-field"
                          value={details.trend || ''}
                          onChange={e => updateDetail(name, 'trend', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="improving">Getting better</option>
                          <option value="stable">About the same</option>
                          <option value="worsening">Getting worse</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </section>

          <div className="flex justify-between gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn-primary">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Additional Info */}
      {step === 3 && (
        <div className="space-y-6">
          <section className="card p-6 sm:p-8 space-y-5" aria-labelledby="words">
            <div>
              <h2 id="words" className="section-title !font-sans">Anything else your care team should know?</h2>
              <p className="text-sm text-muted mt-1">All optional.</p>
            </div>

            <div>
              <label className="label" htmlFor="free-text">In your own words</label>
              <textarea
                id="free-text"
                className="input-field min-h-[120px] resize-y"
                placeholder="For example: I have had a dry cough for about 3 weeks…"
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="other">Anything not on the list?</label>
              <input
                id="other"
                type="text"
                className="input-field"
                placeholder="For example: night sweats"
                value={associatedSymptoms}
                onChange={e => setAssociatedSymptoms(e.target.value)}
              />
            </div>

            {transcript && (
              <div>
                <label className="label" htmlFor="transcript">Your voice note (English text)</label>
                <textarea
                  id="transcript"
                  className="input-field min-h-[80px] resize-y"
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                />
              </div>
            )}
          </section>

          <div className="flex justify-between gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              <Check className="w-4 h-4" /> Send to my care team
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && triageResult && (
        <div className="space-y-6 animate-slide-up">
          {/* Where it went */}
          <section className="card p-6 sm:p-8" aria-labelledby="routed">
            <p id="routed" className="eyebrow mb-3">Where your check-in went</p>
            <RoutingChip priority={triageResult.routingPriority} full className="text-sm !py-1" />
            <p className="mt-4 text-foreground leading-relaxed max-w-prose">{triageResult.explanation}</p>
            <p className="mt-5 pt-4 border-t border-[var(--card-border)] text-sm text-muted flex items-start gap-2">
              <UserCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              A member of your care team reviews every check-in and can change where it goes. This is not a medical assessment.
            </p>
          </section>

          {/* Visit Preparation & Next Steps
              (escalation triggers are kept for the care team's audit trail, not shown here) */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="card p-6" aria-labelledby="next">
              <h2 id="next" className="section-title !font-sans mb-4">What happens next</h2>
              <ol className="space-y-3">
                {triageResult.recommendedActions.map((action, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground">
                    <span className="w-6 h-6 rounded bg-plane text-xs font-semibold text-muted flex items-center justify-center flex-shrink-0 tabular-nums">{i + 1}</span>
                    <span className="pt-0.5">{action}</span>
                  </li>
                ))}
              </ol>
            </section>

            {triageResult.prepSteps.length > 0 && (
              <section className="card p-6" aria-labelledby="prep">
                <h2 id="prep" className="section-title !font-sans mb-4">Before your visit</h2>
                <ul className="space-y-3">
                  {triageResult.prepSteps.map((prep, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground">
                      <ClipboardList className="w-4 h-4 text-primary-600 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                      {prep}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Records attached to the care-team alert */}
          {triageResult.citations.length > 0 && (
            <section className="card p-6" aria-labelledby="attached">
              <h2 id="attached" className="section-title !font-sans mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Sent with your check-in
              </h2>
              <ul className="divide-y divide-[var(--card-border)]">
                {triageResult.citations.map(citation => (
                  <li key={citation.id} className="py-3 first:pt-0 last:pb-0 flex items-baseline gap-3">
                    <span className="citation-badge">{citation.label}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{citation.sourceTitle}</p>
                      <p className="text-xs text-muted">{citation.snippet}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-xs text-subtle flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            {triageResult.disclaimer}
          </p>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => router.push('/dashboard/patient')} className="btn-primary">
              Back to overview
            </button>
            <button onClick={() => router.push('/assistant')} className="btn-secondary">
              <Activity className="w-4 h-4" /> Get ready with the care companion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
