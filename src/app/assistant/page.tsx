'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Shield, Heart, Phone, CalendarCheck, MessageCircle, ArrowRight,
  AlertCircle, CheckCircle, ClipboardList, FileText, Bell, Calendar, Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoPatients, getSymptomReportsForPatient, getDocumentsForPatient, getAlertsForPatient
} from '@/data/demoData';
import { ChatMessage, Patient } from '@/types';
import { format, parseISO } from 'date-fns';

// =============================================
// Shared helpers
// =============================================
function MessageText({ text }: { text: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return null;
        if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\./)) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground mb-1.5 ml-1">
              <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span>{line.replace(/^([-*]|\d+\.)\s*/, '').replace(/\*\*/g, '')}</span>
            </div>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-foreground text-sm mb-1">{line.replace(/\*\*/g, '')}</p>;
        }
        return <p key={i} className="text-sm text-foreground leading-relaxed mb-1">{line.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
}

function useChat(mode: 'patient' | 'clinician', getContext?: () => string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = [...messages, userMsg]
        .slice(-6)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, messages: history, patientContext: getContext?.() }),
      });
      const json = await res.json();
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: json.success
          ? json.content
          : mode === 'patient'
            ? 'I\'m having trouble connecting right now. Please call your clinic directly if you need help.'
            : 'Could not reach the assistant. Please check the GROQ_API_KEY configuration.',
        timestamp: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, send, reset: () => setMessages([]) };
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <div className="space-y-2 w-full max-w-sm" aria-label="Writing a reply">
        <div className="skeleton h-3 w-11/12" />
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

// =============================================
// PATIENT / CAREGIVER VIEW — care companion
// =============================================
function PatientAssistant() {
  const { messages, isLoading, send } = useChat('patient');
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const patientQuestions = [
    'What should I bring to my next follow-up visit?',
    'How do I tell my care team about a new symptom?',
    'Help me write down questions for my doctor',
    'How can my family help me stay on track with my care plan?',
    'When should I go to the emergency room?',
  ];

  const handleSend = () => {
    send(input);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* Left: Info cards */}
      <div className="lg:w-72 flex-shrink-0 space-y-4">
        <div className="card p-4 border-l-4 border-l-emergency-500">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-emergency-500" />
            <p className="font-semibold text-sm text-foreground">When to call emergency</p>
          </div>
          <ul className="space-y-1">
            {[
              'Severe chest pain or trouble breathing',
              'Sudden severe headache or confusion',
              'Uncontrolled bleeding',
              'High fever that won\'t go down',
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted">
                <AlertCircle className="w-3 h-3 text-emergency-500 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-primary-500" />
            <p className="font-semibold text-sm text-foreground">Your care team is with you</p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            This companion helps with appointments, visit preparation and staying on track. It does not assess symptoms or give medical advice — your care team makes every medical decision.
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-4 h-4 text-primary-500" />
            <p className="font-semibold text-sm text-foreground">Quick links</p>
          </div>
          <div className="space-y-2">
            <a href="/timeline" className="flex items-center justify-between gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-plane text-sm text-foreground hover:bg-[var(--plane-strong)] transition-colors">
              View my care timeline <ArrowRight className="w-4 h-4 text-subtle flex-shrink-0" />
            </a>
            <a href="/symptoms" className="flex items-center justify-between gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-plane text-sm text-foreground hover:bg-[var(--plane-strong)] transition-colors">
              Send a check-in to my care team <ArrowRight className="w-4 h-4 text-subtle flex-shrink-0" />
            </a>
            <a href="/upload" className="flex items-center justify-between gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-plane text-sm text-foreground hover:bg-[var(--plane-strong)] transition-colors">
              Upload a report for my care team <ArrowRight className="w-4 h-4 text-subtle flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col card">
        <div className="p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Care Companion</h2>
              <p className="text-2xs text-subtle">Visit prep, reminders and support — in your language</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-3xl bg-plane flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">How can I help today?</h3>
              <p className="text-sm text-subtle max-w-sm mb-6 leading-relaxed">
                Ask about getting ready for a visit, keeping track of appointments, or how your family can help. You can write in Hindi or any Indian language.
              </p>
              <div className="space-y-2 w-full max-w-sm">
                {patientQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="w-full text-left p-3 rounded-xl border border-[var(--card-border)] hover:bg-[var(--hover-bg)] hover:border-primary-300 dark:hover:border-primary-700 transition-all text-sm text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`animate-slide-up ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[80%] bg-primary-600 text-white px-4 py-3 rounded-2xl rounded-br-sm">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-2 max-w-[90%]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-2xs text-subtle font-medium">Care Companion</span>
                  </div>
                  <div className="bg-plane rounded-2xl rounded-bl-sm p-4">
                    <MessageText text={msg.content} />
                  </div>
                  <div className="flex items-start gap-1.5 text-2xs text-subtle mt-1 px-1">
                    <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>General support only — not medical advice. Your care team makes all medical decisions.</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Ask about your visit, reminders, or how to use the app..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn-primary !px-4 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-2xs text-subtle mt-2 text-center">
            If you feel very unwell, call emergency services now — don&apos;t wait for a reply here.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================
// CLINICIAN VIEW — care-coordination assistant
// =============================================

// Administrative view of the record: dates, statuses, titles and the patient's own words.
// Clinical notes, report findings and staging are deliberately left out.
function buildCoordinationContext(patient: Patient): string {
  const checkIns = getSymptomReportsForPatient(patient.id)
    .map(r => `- ${r.createdAt.slice(0, 10)}: reported ${r.symptoms.map(s => s.label).join(', ') || 'free-text only'}; patient's words: "${r.freeText}"; routed to: ${r.triageResult?.routingPriority ?? 'not routed'}`)
    .join('\n');
  const docs = getDocumentsForPatient(patient.id)
    .map(d => `- ${d.reportDate}: ${d.reportType.replace(/_/g, ' ')} from ${d.hospital} (file ${d.fileName})`)
    .join('\n');
  const followUps = patient.followUpSchedule
    .map(f => `- ${f.dueDate}: ${f.type} — ${f.status}`)
    .join('\n');
  const alerts = getAlertsForPatient(patient.id)
    .map(a => `- ${a.createdAt.slice(0, 10)}: ${a.message} (status: ${a.status})`)
    .join('\n');
  const meds = patient.medications
    .filter(m => m.isActive)
    .map(m => `- ${m.name}, ${m.frequency}`)
    .join('\n');

  return `Patient: ${patient.user.name}, ${patient.age}, ${patient.city}
Preferred language: ${patient.preferredLanguage}
Treatment centre: ${patient.treatmentCenter} (${patient.distanceFromCenter} km away); primary doctor: ${patient.primaryDoctor}
Caregiver / emergency contact: ${patient.emergencyContact.name} (${patient.emergencyContact.relationship}), ${patient.emergencyContact.phone}
Follow-up frequency: ${patient.followUpFrequency}

Follow-up appointments:
${followUps || '- none recorded'}

Patient check-ins:
${checkIns || '- none'}

Questions the patient has recorded for the next visit:
- none recorded

Documents on file:
${docs || '- none'}

Care-team alerts:
${alerts || '- none'}

Active prescribed medicines (for reminders only):
${meds || '- none'}`;
}

function ClinicianAssistant() {
  const [patientId, setPatientId] = useState(demoPatients[0].id);
  const patient = demoPatients.find(p => p.id === patientId) ?? demoPatients[0];
  const { messages, isLoading, send, reset } = useChat('clinician', () => buildCoordinationContext(patient));
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const firstName = patient.user.name.split(' ')[0];
  const clinicianQuestions = [
    `Summarise what ${firstName} has reported since the last visit`,
    `Prepare a visit agenda for ${firstName}'s next appointment`,
    `Which of ${firstName}'s follow-ups are overdue or coming up?`,
    `Draft an appointment reminder for ${firstName} in ${patient.preferredLanguage === 'English' ? 'Hindi' : patient.preferredLanguage}`,
    `List the documents ${firstName} has uploaded, newest first`,
  ];

  const nextFollowUp = patient.followUpSchedule.find(f => f.status === 'scheduled');
  const overdue = patient.followUpSchedule.filter(f => f.status === 'overdue');
  const documents = getDocumentsForPatient(patient.id);
  const openAlerts = getAlertsForPatient(patient.id).filter(a => a.status !== 'resolved');

  const handleSend = () => {
    send(input);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] flex gap-4 animate-fade-in">
      {/* Record sidebar */}
      <div className="w-80 hidden lg:block flex-shrink-0">
        <div className="h-full flex flex-col card">
          <div className="p-4 border-b border-[var(--card-border)]">
            <label className="label flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" /> Patient
            </label>
            <select
              className="input-field text-sm"
              value={patientId}
              onChange={e => { setPatientId(e.target.value); reset(); }}
            >
              {demoPatients.map(p => (
                <option key={p.id} value={p.id}>{p.user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div className="evidence-card">
              <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Follow-ups
              </p>
              <p className="text-muted">
                Next: {nextFollowUp ? `${format(parseISO(nextFollowUp.dueDate), 'MMM d, yyyy')} — ${nextFollowUp.type}` : 'none scheduled'}
              </p>
              {overdue.length > 0 && (
                <p className="text-urgent-600 dark:text-urgent-400 mt-1">{overdue.length} overdue</p>
              )}
            </div>
            <div className="evidence-card">
              <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Open alerts
              </p>
              <p className="text-muted">{openAlerts.length === 0 ? 'None' : `${openAlerts.length} awaiting care-team action`}</p>
            </div>
            <div className="evidence-card">
              <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documents on file
              </p>
              {documents.length === 0 ? <p className="text-muted">None</p> : (
                <ul className="space-y-1 text-muted">
                  {documents.map(d => (
                    <li key={d.id}>{d.reportDate} · {d.reportType.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="evidence-card">
              <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Caregiver
              </p>
              <p className="text-muted">{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
              <p className="text-muted">Prefers: {patient.preferredLanguage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col card">
        <div className="p-4 border-b border-[var(--card-border)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">Care Coordination Assistant</h2>
            <p className="text-2xs text-subtle">Visit prep, follow-up tracking and patient messages for {patient.user.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Get ready for the next visit</h3>
              <p className="text-sm text-subtle max-w-md mb-6">
                Summarise check-ins, track follow-ups and draft patient messages. The assistant restates the record — it does not interpret results or suggest clinical actions.
              </p>
              <div className="space-y-2 w-full max-w-md">
                {clinicianQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="w-full text-left p-3 rounded-xl border border-[var(--card-border)] hover:bg-[var(--hover-bg)] transition-colors text-sm text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`animate-slide-up ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[80%] bg-primary-600 text-white px-4 py-3 rounded-2xl rounded-br-sm">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-plane rounded-2xl rounded-bl-sm p-4">
                    <MessageText text={msg.content} />
                  </div>
                  <div className="flex items-start gap-2 text-2xs text-subtle">
                    <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Draft for care-team review. Edit before sending anything to a patient.</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Summarise check-ins, list follow-ups, draft a reminder..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn-primary !px-4 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// Root: pick view by role
// =============================================
export default function AssistantPage() {
  const { user } = useAuth();
  const isPatient = !user || user.role === 'patient' || user.role === 'caregiver';
  return isPatient ? <PatientAssistant /> : <ClinicianAssistant />;
}
