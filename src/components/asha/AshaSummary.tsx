'use client';
import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SYMPTOM_DEFINITIONS, SymptomName } from '@/types';
import { AshaState, AshaDetailField, labelFor, mergeSymptom, removeSymptom, setDetail } from '@/lib/asha/slots';
import { AshaLine } from './types';

const OPTIONS: Record<AshaDetailField, { label: string; values: [string, string][] }> = {
  severity: { label: 'How strong?', values: [['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']] },
  duration: {
    label: 'For how long?',
    values: [['1-2 days', '1–2 days'], ['3-5 days', '3–5 days'], ['1 week', 'About 1 week'], ['2 weeks', 'About 2 weeks'], ['3 weeks', 'About 3 weeks'], ['1 month+', 'A month or more']],
  },
  frequency: { label: 'How often?', values: [['occasional', 'Now and then'], ['frequent', 'Often'], ['constant', 'All the time']] },
  trend: { label: 'Better or worse?', values: [['improving', 'Getting better'], ['stable', 'About the same'], ['worsening', 'Getting worse']] },
};

export function AshaSummary({
  state, lines, onChange, onConfirm, onTalkAgain, isCaregiver, patientFirstName,
}: {
  state: AshaState;
  lines: AshaLine[];
  onChange: (s: AshaState) => void;
  onConfirm: () => void;
  onTalkAgain: () => void;
  isCaregiver: boolean;
  patientFirstName: string;
}) {
  const [showConversation, setShowConversation] = useState(false);
  const [adding, setAdding] = useState<SymptomName | ''>('');
  const nothing = state.order.length === 0 && state.otherSymptoms.length === 0 && state.notes.length === 0;
  const available = SYMPTOM_DEFINITIONS.filter(d => !state.order.includes(d.name));

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card" aria-labelledby="summary-title">
        <div className="p-6 sm:px-8 sm:pt-8">
          <p className="eyebrow mb-2">From your conversation with Asha</p>
          <h2 id="summary-title" className="font-display text-2xl text-foreground">
            Here&apos;s what will go to {isCaregiver ? `${patientFirstName}'s` : 'your'} care team
          </h2>
          <p className="text-muted mt-2">Check it over. You can change anything Asha got wrong, or add something she missed.</p>
        </div>

        {nothing && (
          <p className="px-6 sm:px-8 pb-6 text-foreground">Nothing new to report — your care team will see that you checked in.</p>
        )}

        <div className="divide-y divide-[var(--card-border)]">
          {state.order.map(name => {
            const d = state.symptoms[name] ?? {};
            return (
              <fieldset key={name} className="px-6 sm:px-8 py-5">
                <legend className="sr-only">{labelFor(name)}</legend>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="font-medium text-foreground" aria-hidden="true">{labelFor(name)}</p>
                  <button onClick={() => onChange(removeSymptom(state, name))} className="btn-ghost !min-h-[32px] !px-2 text-sm">
                    <X className="w-4 h-4" /> Remove
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.keys(OPTIONS) as AshaDetailField[]).map(field => (
                    <div key={field}>
                      <label className="label !text-xs !font-normal text-muted" htmlFor={`${name}-${field}`}>{OPTIONS[field].label}</label>
                      <select
                        id={`${name}-${field}`}
                        className="input-field !text-sm"
                        value={d[field] ?? ''}
                        onChange={e => onChange(setDetail(state, name, field, e.target.value || undefined))}
                      >
                        <option value="">Not sure</option>
                        {OPTIONS[field].values.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </fieldset>
            );
          })}

          {state.otherSymptoms.length > 0 && (
            <div className="px-6 sm:px-8 py-5">
              <label className="label" htmlFor="other">Also mentioned</label>
              <input
                id="other"
                className="input-field"
                value={state.otherSymptoms.join(', ')}
                onChange={e => onChange({ ...state, otherSymptoms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          )}

          <div className="px-6 sm:px-8 py-5">
            <label className="label" htmlFor="notes">Anything else for the care team</label>
            <textarea
              id="notes"
              className="input-field min-h-[80px] resize-y"
              placeholder="Optional"
              value={state.notes.join('\n')}
              onChange={e => onChange({ ...state, notes: e.target.value.split('\n').filter(n => n.trim()) })}
            />
          </div>

          {available.length > 0 && (
            <div className="px-6 sm:px-8 py-5 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[12rem]">
                <label className="label" htmlFor="add-symptom">Add something Asha missed</label>
                <select id="add-symptom" className="input-field" value={adding} onChange={e => setAdding(e.target.value as SymptomName | '')}>
                  <option value="">Choose…</option>
                  {available.map(d => <option key={d.name} value={d.name}>{d.label}</option>)}
                </select>
              </div>
              <button
                onClick={() => { if (adding) { onChange(mergeSymptom(state, adding, {})); setAdding(''); } }}
                disabled={!adding}
                className="btn-secondary disabled:opacity-40"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </section>

      {lines.length > 0 && (
        <section className="panel">
          <button
            onClick={() => setShowConversation(v => !v)}
            aria-expanded={showConversation}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-foreground"
          >
            Your conversation with Asha ({lines.length} messages) — also shared with your care team
            {showConversation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showConversation && (
            <ol className="px-6 pb-5 space-y-2">
              {lines.map(l => (
                <li key={l.id} className="text-sm">
                  <span className="font-medium text-foreground">{l.who === 'asha' ? 'Asha' : 'You'}:</span>{' '}
                  <span className="text-muted">{l.text}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <button onClick={onTalkAgain} className="btn-ghost">Talk to Asha again</button>
        <button onClick={onConfirm} className="btn-primary !min-h-[48px] !px-5">
          <Check className="w-4 h-4" /> Send to my care team
        </button>
      </div>
    </div>
  );
}
