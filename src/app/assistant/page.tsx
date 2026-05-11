'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Brain, Send, FileText, Shield, ChevronDown, ChevronUp,
  ArrowRight, BookOpen, Sparkles, Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoPatients, demoAIAssessments,
  getPatientByUserId
} from '@/data/demoData';
import { ChatMessage, Citation } from '@/types';

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
    <button
      onClick={onClick}
      className="citation-badge"
      title={citation.sourceTitle}
    >
      {citation.label}
    </button>
  );
}

// Parse response text and insert citation badges
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
                        if (citation) {
                          return <CitationBadge key={i} citation={citation} onClick={() => onCitationClick(citation)} />;
                        }
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
                    if (citation) {
                      return <CitationBadge key={i} citation={citation} onClick={() => onCitationClick(citation)} />;
                    }
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

export default function AssistantPage() {
  const { user } = useAuth();
  const patient = user ? getPatientByUserId(user.id) : demoPatients[0];
  const assessment = demoAIAssessments[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
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

    // Simulate AI response with demo assessment
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: assessment.response,
        timestamp: new Date().toISOString(),
        citations: assessment.citations,
        triageResult: {
          urgencyLevel: assessment.urgencyLevel,
          explanation: assessment.explanation,
          recommendedActions: assessment.recommendedActions,
          suggestedTests: assessment.suggestedTests,
          redFlagTriggers: assessment.redFlagTriggers,
          confidenceBand: assessment.confidenceBand,
          citations: assessment.citations,
          disclaimer: 'This tool is for follow-up support and does not replace a doctor\'s diagnosis.',
        },
        retrievedDocuments: assessment.retrievedDocuments,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Retrieved docs */}
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

            {/* Patient Summary */}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col card">
        {/* Chat Header */}
        <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">AI Follow-up Assistant</h2>
              <p className="text-2xs text-surface-400">Evidence-grounded guidance with citations</p>
            </div>
          </div>
          {!showEvidence && (
            <button onClick={() => setShowEvidence(true)} className="btn-ghost text-xs gap-1 hidden lg:flex">
              <BookOpen className="w-3.5 h-3.5" /> Evidence
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ask about your follow-up care</h3>
              <p className="text-sm text-surface-400 max-w-md mb-6">
                Get evidence-based guidance grounded in your records and trusted oncology guidelines. Every recommendation is cited.
              </p>
              <div className="space-y-2 w-full max-w-md">
                {[
                  'I have had a dry cough for 3 weeks that is getting worse',
                  'What does my recent chest X-ray result mean?',
                  'When should I get my next blood work done?',
                  'I am experiencing bone pain in my lower back',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
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
                  {/* Triage Badge */}
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

                  {/* Response */}
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl rounded-bl-sm p-4">
                    <FormattedResponse
                      text={msg.content}
                      citations={msg.citations || []}
                      onCitationClick={setSelectedCitation}
                    />
                  </div>

                  {/* Why this recommendation */}
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

                  {/* What was used */}
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
                          }`}>
                            {doc.type === 'record' ? 'REC' : 'GDL'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{doc.title}</p>
                            {doc.date && <p className="text-surface-400 mt-0.5">{doc.date}</p>}
                          </div>
                          <span className="text-2xs text-surface-400">{Math.round(doc.relevanceScore * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 text-2xs text-surface-400 mt-2">
                    <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>This tool is for follow-up support and does not replace a doctor&apos;s diagnosis.</span>
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

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Ask about your symptoms, reports, or follow-up care..."
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
            {selectedCitation.date && (
              <p className="text-xs text-surface-400 mt-2">Date: {selectedCitation.date}</p>
            )}
            <button
              onClick={() => setSelectedCitation(null)}
              className="btn-secondary w-full mt-4 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
