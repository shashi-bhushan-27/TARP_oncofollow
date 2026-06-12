'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Brain, Send, Shield, Sparkles, Heart, Phone,
  CalendarCheck, MessageCircle, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoPatients, demoAIAssessments
} from '@/data/demoData';
import { inpatients } from '@/data/labData';
import { ChatMessage, Citation } from '@/types';
import {
  BookOpen, FileText, ChevronDown, ChevronUp,
  ArrowRight, Activity
} from 'lucide-react';

// =============================================
// Shared helpers
// =============================================
function UrgencyChip({ level }: { level: string }) {
  const classes: Record<string, string> = {
    routine: 'chip-routine', soon: 'chip-soon', urgent: 'chip-urgent', emergency: 'chip-emergency',
  };
  const labels: Record<string, string> = {
    routine: '● Routine Monitoring', soon: '● Contact Doctor Soon',
    urgent: '● Urgent Oncology Review', emergency: '🚨 Emergency',
  };
  return <span className={classes[level] || ''}>{labels[level] || level}</span>;
}

function CitationBadge({ citation, onClick }: { citation: Citation; onClick: () => void }) {
  return (
    <button onClick={onClick} className="citation-badge" title={citation.sourceTitle}>
      {citation.label}
    </button>
  );
}

function FormattedResponse({ text, citations, onCitationClick }: {
  text: string;
  citations: Citation[];
  onCitationClick: (c: Citation) => void;
}) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {text.split('\n\n').map((paragraph, pi) => (
        <div key={pi} className="mb-3">
          {paragraph.split('\n').map((line, li) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={li} className="font-semibold text-foreground text-sm mb-1">{line.replace(/\*\*/g, '')}</p>;
            }
            if (line.startsWith('- ') || line.match(/^\d+\./)) {
              const content = line.replace(/^[-\d.]+\s*/, '');
              return (
                <div key={li} className="flex items-start gap-2 text-sm text-foreground mb-1 ml-2">
                  <ArrowRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-1" />
                  <span>
                    {content.split(/(\[(?:R|G)\d+\])/g).map((part, i) => {
                      const match = part.match(/^\[(R|G)(\d+)\]$/);
                      if (match) {
                        const citation = citations.find(c => c.label === part);
                        if (citation) return <CitationBadge key={i} citation={citation} onClick={() => onCitationClick(citation)} />;
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </span>
                </div>
              );
            }
            return (
              <p key={li} className="text-sm text-foreground leading-relaxed mb-1">
                {line.split(/(\[(?:R|G)\d+\])/g).map((part, i) => {
                  const match = part.match(/^\[(R|G)(\d+)\]$/);
                  if (match) {
                    const citation = citations.find(c => c.label === part);
                    if (citation) return <CitationBadge key={i} citation={citation} onClick={() => onCitationClick(citation)} />;
                  }
                  return <span key={i}>{part}</span>;
                })}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// =============================================
// PATIENT VIEW — simple, calm, no jargon
// =============================================
function PatientAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const patientQuestions = [
    'I\'ve been feeling more tired than usual lately',
    'I have some pain — when should I call my doctor?',
    'What should I expect at my next follow-up visit?',
    'Is it normal to feel this way after treatment?',
    'When do I need to go to the emergency room?',
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyMessages = [...messages, userMsg]
        .slice(-6)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'patient',
          messages: historyMessages,
        }),
      });

      const json = await res.json();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: json.success ? json.content : 'I\'m having trouble connecting right now. Please call your doctor\'s clinic directly if you have an urgent concern.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please call your care team if you have an urgent concern.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* Left: Info cards */}
      <div className="lg:w-72 flex-shrink-0 space-y-4">
        {/* Emergency card */}
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
              <li key={i} className="flex items-start gap-2 text-xs text-surface-600 dark:text-surface-400">
                <AlertCircle className="w-3 h-3 text-emergency-500 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Reassurance card */}
        <div className="card p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-primary-500" />
            <p className="font-semibold text-sm text-foreground">Your care team is with you</p>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            This assistant helps you understand your symptoms and when to reach out. Your doctor will always make the final call — never this app.
          </p>
        </div>

        {/* Next steps card */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-4 h-4 text-primary-500" />
            <p className="font-semibold text-sm text-foreground">Quick contacts</p>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs text-foreground hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              📞 Call my clinic
            </button>
            <button className="w-full text-left p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs text-foreground hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              📅 View next appointment
            </button>
            <button className="w-full text-left p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs text-foreground hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              📋 Report a symptom
            </button>
          </div>
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col card">
        {/* Header */}
        <div className="p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Health Guide</h2>
              <p className="text-2xs text-surface-400">Here to support you — not replace your doctor</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-950 dark:to-primary-900 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">How are you feeling today?</h3>
              <p className="text-sm text-surface-400 max-w-sm mb-6 leading-relaxed">
                You can ask me about your symptoms, what to expect during recovery, or when you should call your doctor.
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
                    <span className="text-2xs text-surface-400 font-medium">Health Guide</span>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl rounded-bl-sm p-4">
                    {/* Simple formatted text — no clinical badges */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.content.split('\n').map((line, i) => {
                        if (!line.trim()) return null;
                        if (line.startsWith('- ') || line.match(/^\d+\./)) {
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-foreground mb-1.5 ml-1">
                              <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                              <span>{line.replace(/^[-\d.]+\s*/, '')}</span>
                            </div>
                          );
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-semibold text-foreground text-sm mb-1">{line.replace(/\*\*/g, '')}</p>;
                        }
                        return <p key={i} className="text-sm text-foreground leading-relaxed mb-1">{line}</p>;
                      })}
                    </div>
                  </div>
                  {/* Simple disclaimer */}
                  <div className="flex items-start gap-1.5 text-2xs text-surface-400 mt-1 px-1">
                    <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>This is general guidance only. Always follow your doctor&apos;s advice.</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-600 animate-pulse-soft" />
              </div>
              <div className="space-y-1.5">
                <div className="skeleton h-2.5 w-40 rounded-full" />
                <div className="skeleton h-2.5 w-28 rounded-full" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="How are you feeling? Describe your symptoms..."
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
          <p className="text-2xs text-surface-400 mt-2 text-center">
            🚨 If you feel very unwell, call emergency services immediately — don&apos;t wait for an AI response.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================
// CLINICIAN VIEW — full clinical AI assistant
// =============================================
function ClinicianAssistant() {
  const patient = demoPatients[0];
  const assessment = demoAIAssessments[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildClinicalContext = () => {
    const ip = inpatients[0];
    const labSummary = Object.values(ip.labs)
      .map(p => `${p.name}: ${p.data.map(d => d.value).join('→')} ${p.unit} (ref ${p.refLow}-${p.refHigh})`)
      .join('\n');
    const vitalSummary = Object.values(ip.vitals)
      .map(p => `${p.name}: ${p.data.map(d => d.value).join('→')} ${p.unit}`)
      .join('\n');
    return `INPATIENT MONITORING CONTEXT:\nPatient: ${ip.name}, ${ip.age}${ip.sex}, ${ip.ward}\nDiagnosis: ${ip.diagnosis}\nNEWS2 Score: ${ip.news2Score} (${ip.news2Trend})\nPrimary Concern: ${ip.primaryConcern}\n\n7-Day Lab Trends:\n${labSummary}\n\n7-Day Vital Trends:\n${vitalSummary}\n\nClinical Summary: ${ip.clinicalSummary}`;
  };

  const clinicianQuestions = [
    'Explain the significance of the rising creatinine trend in patient Sunita Agarwal',
    'What does the declining SpO₂ trend in Arjun Nair suggest clinically?',
    'Assess the hemoglobin trend in Ramesh Verma — should I be concerned?',
    'What clinical actions should I take for a NEWS2 score of 9?',
    'Summarize the current inpatients by clinical risk priority',
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyMessages = [...messages, userMsg]
        .slice(-6)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'assistant',
          messages: historyMessages,
          patientContext: buildClinicalContext(),
        }),
      });

      const json = await res.json();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: json.success ? json.content : '⚠️ Could not connect to Groq. Please check your API key.',
        timestamp: new Date().toISOString(),
        citations: [],
        retrievedDocuments: assessment.retrievedDocuments,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] flex gap-4 animate-fade-in">
      {/* Evidence Sidebar */}
      <div className={`${showEvidence ? 'w-80' : 'w-0'} hidden lg:block flex-shrink-0 transition-all overflow-hidden`}>
        <div className="h-full flex flex-col card">
          <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              Evidence Panel
            </h3>
            <button onClick={() => setShowEvidence(false)} className="btn-ghost !p-1">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Patient Records</p>
              {assessment.retrievedDocuments.filter(d => d.type === 'record').map(doc => (
                <div key={doc.id} className="evidence-card mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{doc.title}</span>
                    <span className="text-2xs text-surface-400">{Math.round(doc.relevanceScore * 100)}%</span>
                  </div>
                  <p className="text-xs text-surface-500 leading-relaxed">{doc.snippet}</p>
                  {doc.date && <p className="text-2xs text-surface-400 mt-1">{doc.date}</p>}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Guidelines</p>
              {assessment.retrievedDocuments.filter(d => d.type === 'guideline').map(doc => (
                <div key={doc.id} className="evidence-card mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{doc.title}</span>
                    <span className="text-2xs text-surface-400">{Math.round(doc.relevanceScore * 100)}%</span>
                  </div>
                  <p className="text-xs text-surface-500 leading-relaxed">{doc.snippet}</p>
                </div>
              ))}
            </div>
            {patient && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Patient Context</p>
                <div className="evidence-card">
                  <p className="text-xs font-medium text-foreground mb-1">{patient.user.name}</p>
                  <div className="text-xs text-surface-500 space-y-0.5">
                    <p>Stage {patient.cancerStage} • {patient.receptorStatus.join('/')}</p>
                    <p>{patient.treatmentHistory.length} treatments completed</p>
                    <p>{patient.medications.filter(m => m.isActive).length} active medications</p>
                    <p>Follow-up: {patient.followUpFrequency}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col card">
        <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">LCIIS Clinical Assistant</h2>
              <p className="text-2xs text-surface-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-primary-500" />
                Groq Llama 3.3 70B — Live clinical AI
              </p>
            </div>
          </div>
          {!showEvidence && (
            <button onClick={() => setShowEvidence(true)} className="btn-ghost text-xs gap-1 hidden lg:flex">
              <BookOpen className="w-3.5 h-3.5" /> Evidence
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Clinical Monitoring Assistant</h3>
              <p className="text-sm text-surface-400 max-w-md mb-2">
                Ask about patient lab trends, deterioration patterns, NEWS2 scores, or clinical protocols.
              </p>
              <p className="text-2xs text-primary-600 dark:text-primary-400 mb-6 font-medium">
                ⚡ Live Groq AI — powered by Llama 3.3 70B
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
                <div className="space-y-3">
                  {msg.triageResult && (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                      msg.triageResult.urgencyLevel === 'emergency' ? 'bg-emergency-50 dark:bg-emergency-950/50' :
                      msg.triageResult.urgencyLevel === 'urgent' ? 'bg-urgent-50 dark:bg-urgent-950/50' :
                      msg.triageResult.urgencyLevel === 'soon' ? 'bg-caution-50 dark:bg-caution-950/50' :
                      'bg-primary-50 dark:bg-primary-950/50'
                    }`}>
                      <UrgencyChip level={msg.triageResult.urgencyLevel} />
                    </div>
                  )}
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl rounded-bl-sm p-4">
                    <FormattedResponse
                      text={msg.content}
                      citations={msg.citations || []}
                      onCitationClick={setSelectedCitation}
                    />
                  </div>
                  {msg.triageResult && (
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Why this recommendation?
                      {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {showReasoning && (
                    <div className="evidence-card animate-slide-down text-xs">
                      <p className="font-medium text-foreground mb-1">Reasoning Summary</p>
                      <p className="text-surface-500 leading-relaxed">{assessment.reasoningSummary}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setShowSources(!showSources)}
                    className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    What was used? ({msg.retrievedDocuments?.length || 0} sources)
                    {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showSources && msg.retrievedDocuments && (
                    <div className="space-y-2 animate-slide-down">
                      {msg.retrievedDocuments.map(doc => (
                        <div key={doc.id} className="evidence-card text-xs flex items-start gap-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-2xs font-bold ${
                            doc.type === 'record'
                              ? 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300'
                              : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                          }`}>{doc.type === 'record' ? 'REC' : 'GDL'}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{doc.title}</p>
                            {doc.date && <p className="text-surface-400 mt-0.5">{doc.date}</p>}
                          </div>
                          <span className="text-2xs text-surface-400">{Math.round(doc.relevanceScore * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-2xs text-surface-400 mt-2">
                    <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Clinical AI support only. Physician judgment required for all decisions.</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-600 animate-pulse-soft" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-3 w-48 rounded-full" />
                <div className="skeleton h-3 w-36 rounded-full" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Ask about lab trends, NEWS2 scores, clinical protocols..."
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

      {/* Citation Popover */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedCitation(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative card p-6 max-w-md mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <span className="citation-badge text-sm">{selectedCitation.label}</span>
              <span className={`text-2xs font-bold px-2 py-0.5 rounded ${
                selectedCitation.sourceType === 'record'
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300'
                  : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
              }`}>
                {selectedCitation.sourceType === 'record' ? 'Patient Record' : 'Clinical Guideline'}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-2">{selectedCitation.sourceTitle}</h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed bg-surface-50 dark:bg-surface-800 p-3 rounded-lg">
              &ldquo;{selectedCitation.snippet}&rdquo;
            </p>
            {selectedCitation.date && <p className="text-xs text-surface-400 mt-2">Date: {selectedCitation.date}</p>}
            <button onClick={() => setSelectedCitation(null)} className="btn-secondary w-full mt-4 text-sm">Close</button>
          </div>
        </div>
      )}
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
