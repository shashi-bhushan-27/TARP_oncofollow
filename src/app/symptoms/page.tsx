'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ChevronRight, ChevronLeft, Mic, MicOff, Check,
  AlertTriangle, Phone, Shield, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  SYMPTOM_DEFINITIONS, SymptomEntry, SymptomName, Severity, Frequency, Trend, TriageResult
} from '@/types';
import { demoPatients, getPatientByUserId } from '@/data/demoData';
import { runTriage } from '@/lib/triage';
import { scanForRedFlags, scanSymptomsForRedFlags } from '@/lib/safety';

function UrgencyChip({ level }: { level: string }) {
  const classes: Record<string, string> = {
    routine: 'chip-routine', soon: 'chip-soon', urgent: 'chip-urgent', emergency: 'chip-emergency',
  };
  const labels: Record<string, string> = {
    routine: '● Routine Monitoring', soon: '● Contact Doctor Soon',
    urgent: '● Urgent Oncology Review', emergency: '🚨 Seek Emergency Care Now',
  };
  return <span className={`${classes[level] || ''} text-sm`}>{labels[level] || level}</span>;
}

export default function SymptomsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const patient = user ? getPatientByUserId(user.id) : demoPatients[0];
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<SymptomName>>(new Set());
  const [symptomDetails, setSymptomDetails] = useState<Record<SymptomName, Partial<SymptomEntry>>>({} as Record<SymptomName, Partial<SymptomEntry>>);
  const [freeText, setFreeText] = useState('');
  const [associatedSymptoms, setAssociatedSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

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

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate transcript from voice
      setTranscript('I have been feeling a persistent dry cough for about 3 weeks now. It seems to be getting worse. I also feel some discomfort in my chest when I cough hard. I am more tired than usual.');
    } else {
      setIsRecording(true);
      setTranscript('');
    }
  };

  const handleSubmit = () => {
    if (!patient) return;

    const symptoms: SymptomEntry[] = Array.from(selectedSymptoms).map(name => {
      const def = SYMPTOM_DEFINITIONS.find(d => d.name === name);
      const details = symptomDetails[name] || {};
      return {
        name,
        label: def?.label || name,
        severity: (details.severity as Severity) || 'moderate',
        duration: (details.duration as string) || '1 week',
        frequency: (details.frequency as Frequency) || 'frequent',
        trend: (details.trend as Trend) || 'stable',
      };
    });

    const allText = `${freeText} ${associatedSymptoms} ${transcript}`;

    // Check for emergency red flags first
    const textFlags = scanForRedFlags(allText);
    const symptomFlags = scanSymptomsForRedFlags(symptoms);

    if (textFlags.isEmergency || symptomFlags.isEmergency) {
      setShowEmergency(true);
    }

    // Run triage
    const result = runTriage({
      symptoms,
      freeText: freeText || transcript,
      associatedSymptoms,
      patient,
      recentDocuments: [],
    });

    setTriageResult(result);
    setStep(4); // Show results
  };

  // Emergency Overlay
  if (showEmergency) {
    return (
      <div className="emergency-overlay animate-fade-in">
        <div className="max-w-lg mx-auto p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 animate-emergency-pulse">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Emergency Symptoms Detected
          </h1>
          <p className="text-emergency-100 text-lg mb-6 leading-relaxed">
            Your symptoms include indicators that require <strong>immediate emergency evaluation</strong>.
            Please go to the nearest emergency department or call emergency services now.
          </p>
          <div className="space-y-3 mb-8 text-left">
            <div className="p-4 rounded-xl bg-white/10 text-white">
              <p className="font-semibold mb-1">Do NOT delay — act now:</p>
              <ul className="text-sm space-y-1 text-emergency-100">
                <li>• Call your local emergency number</li>
                <li>• Or go to the nearest emergency department</li>
                <li>• Bring your cancer treatment records if available</li>
                <li>• Tell the ER about your breast cancer history</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowEmergency(false)}
              className="w-full py-3 rounded-xl bg-white text-emergency-700 font-semibold hover:bg-emergency-50 transition-colors"
            >
              I understand — view assessment details
            </button>
          </div>
          <p className="text-emergency-200 text-xs mt-6">
            ⚕️ This tool is for follow-up support and does not replace a doctor&apos;s diagnosis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Symptom Check-in</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          {step < 4 ? `Step ${step} of 3` : 'Your Assessment'}
        </p>
      </div>

      {/* Progress Bar */}
      {step < 4 && (
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
            }`} />
          ))}
        </div>
      )}

      {/* Step 1: Select Symptoms */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">What symptoms are you experiencing?</h2>
            <p className="text-sm text-surface-400 mb-4">Select all that apply</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_DEFINITIONS.map(def => {
                const selected = selectedSymptoms.has(def.name);
                return (
                  <button
                    key={def.name}
                    onClick={() => toggleSymptom(def.name)}
                    className={`p-3 rounded-xl border text-left transition-all min-h-touch ${
                      selected
                        ? def.isRedFlag
                          ? 'bg-emergency-50 dark:bg-emergency-950 border-emergency-300 dark:border-emergency-700 ring-2 ring-emergency-300'
                          : 'bg-primary-50 dark:bg-primary-950 border-primary-300 dark:border-primary-700 ring-2 ring-primary-300'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-[var(--hover-bg)]'
                    }`}
                    id={`symptom-${def.name}`}
                  >
                    <span className="text-lg">{def.icon}</span>
                    <p className={`text-sm font-medium mt-1 ${selected ? 'text-foreground' : 'text-surface-600 dark:text-surface-400'}`}>
                      {def.label}
                    </p>
                    {def.isRedFlag && selected && (
                      <p className="text-2xs text-emergency-600 dark:text-emergency-400 mt-0.5 font-medium">⚠ Red flag</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Recording */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Or describe by voice</h2>
            <p className="text-sm text-surface-400 mb-4">Press and hold to record</p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleVoiceToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-emergency-500 text-white animate-pulse-soft'
                    : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-200'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                {isRecording ? (
                  <p className="text-sm text-emergency-600 font-medium">Recording... tap to stop</p>
                ) : transcript ? (
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <p className="text-sm text-foreground">{transcript}</p>
                    <p className="text-2xs text-surface-400 mt-1">Transcript — you can edit this</p>
                  </div>
                ) : (
                  <p className="text-sm text-surface-400">Tap the microphone to start recording</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={selectedSymptoms.size === 0 && !transcript}
            className="btn-primary w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tell us more about each symptom</h2>

            <div className="space-y-6">
              {Array.from(selectedSymptoms).map(name => {
                const def = SYMPTOM_DEFINITIONS.find(d => d.name === name);
                const details = symptomDetails[name] || {};
                return (
                  <div key={name} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 space-y-3">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <span>{def?.icon}</span> {def?.label}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Severity</label>
                        <select
                          className="input-field text-sm"
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
                        <label className="label">Duration</label>
                        <select
                          className="input-field text-sm"
                          value={details.duration || ''}
                          onChange={e => updateDetail(name, 'duration', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="1-2 days">1–2 days</option>
                          <option value="3-5 days">3–5 days</option>
                          <option value="1 week">~1 week</option>
                          <option value="2 weeks">~2 weeks</option>
                          <option value="3 weeks">~3 weeks</option>
                          <option value="1 month+">1 month+</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">How often?</label>
                        <select
                          className="input-field text-sm"
                          value={details.frequency || ''}
                          onChange={e => updateDetail(name, 'frequency', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="occasional">Occasional</option>
                          <option value="frequent">Frequent</option>
                          <option value="constant">Constant</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Getting better or worse?</label>
                        <select
                          className="input-field text-sm"
                          value={details.trend || ''}
                          onChange={e => updateDetail(name, 'trend', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="improving">Improving</option>
                          <option value="stable">About the same</option>
                          <option value="worsening">Getting worse</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1 gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Additional Info */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Anything else you want to share?</h2>

            <div>
              <label className="label">Describe how you feel in your own words (optional)</label>
              <textarea
                className="input-field min-h-[120px] resize-y"
                placeholder="e.g., I have had a dry cough for about 3 weeks..."
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Any other symptoms not listed?</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., night sweats, mild breathlessness on exertion"
                value={associatedSymptoms}
                onChange={e => setAssociatedSymptoms(e.target.value)}
              />
            </div>

            {transcript && (
              <div>
                <label className="label">Voice transcript</label>
                <textarea
                  className="input-field min-h-[80px] resize-y text-sm"
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1 gap-2">
              <Check className="w-4 h-4" /> Submit Report
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && triageResult && (
        <div className="space-y-4 animate-slide-up">
          {/* Urgency Banner */}
          <div className={`p-6 rounded-2xl border ${
            triageResult.urgencyLevel === 'emergency' ? 'bg-emergency-50 dark:bg-emergency-950/50 border-emergency-200 dark:border-emergency-800' :
            triageResult.urgencyLevel === 'urgent' ? 'bg-urgent-50 dark:bg-urgent-950/50 border-urgent-200 dark:border-urgent-800' :
            triageResult.urgencyLevel === 'soon' ? 'bg-caution-50 dark:bg-caution-950/50 border-caution-200 dark:border-caution-800' :
            'bg-primary-50 dark:bg-primary-950/50 border-primary-200 dark:border-primary-800'
          }`}>
            <UrgencyChip level={triageResult.urgencyLevel} />
            <p className="mt-3 text-sm text-foreground leading-relaxed">{triageResult.explanation}</p>
          </div>

          {/* Red Flags */}
          {triageResult.redFlagTriggers.length > 0 && (
            <div className="p-4 rounded-xl bg-emergency-50 dark:bg-emergency-950/50 border border-emergency-200 dark:border-emergency-800">
              <p className="font-semibold text-emergency-800 dark:text-emergency-200 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Red Flags Detected
              </p>
              <ul className="mt-2 space-y-1">
                {triageResult.redFlagTriggers.map((flag, i) => (
                  <li key={i} className="text-sm text-emergency-700 dark:text-emergency-300">• {flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="card p-6">
            <h3 className="font-semibold text-foreground mb-3">Recommended Next Steps</h3>
            <ul className="space-y-2">
              {triageResult.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <ArrowRight className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Tests */}
          {triageResult.suggestedTests.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-foreground mb-3">Suggested Tests to Discuss with Your Doctor</h3>
              <div className="flex flex-wrap gap-2">
                {triageResult.suggestedTests.map((test, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-sm text-foreground border border-[var(--card-border)]">
                    {test}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Citations */}
          {triageResult.citations.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-foreground mb-3">Evidence Sources</h3>
              <div className="space-y-3">
                {triageResult.citations.map(citation => (
                  <div key={citation.id} className="evidence-card">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="citation-badge">{citation.label}</span>
                      <span className="text-xs font-medium text-foreground">{citation.sourceTitle}</span>
                    </div>
                    <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{citation.snippet}</p>
                    {citation.date && (
                      <p className="text-2xs text-surface-400 mt-1">{citation.date}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-[var(--card-border)]">
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-start gap-2">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {triageResult.disclaimer}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/assistant')}
              className="btn-primary flex-1 gap-2"
            >
              <Activity className="w-4 h-4" /> Ask AI Assistant
            </button>
            <button
              onClick={() => router.push('/dashboard/patient')}
              className="btn-secondary flex-1 gap-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
