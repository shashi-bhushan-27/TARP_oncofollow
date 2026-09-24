// =============================================
// Asha — check-in slots
// Tracks what the patient has told Asha and what the check-in form still needs.
// Code (not the model) decides when a symptom is complete, so every conversation
// ends with the same structured data the manual form collects.
// =============================================

import { SymptomEntry, SymptomName, SYMPTOM_DEFINITIONS } from '@/types';

export type AshaDetailField = 'severity' | 'duration' | 'frequency' | 'trend';
export type AshaDetail = Partial<Pick<SymptomEntry, AshaDetailField>>;

export interface AshaState {
  symptoms: Partial<Record<SymptomName, AshaDetail>>;
  order: SymptomName[];          // in the order the patient mentioned them
  otherSymptoms: string[];       // things not on the list, in the patient's words
  notes: string[];               // anything else for the care team
}

export const DETAIL_FIELDS: AshaDetailField[] = ['severity', 'duration', 'frequency', 'trend'];

// Plain-language names used in prompts and the summary
export const FIELD_QUESTIONS: Record<AshaDetailField, string> = {
  severity: 'how strong it is',
  duration: 'how long it has been going on',
  frequency: 'how often it happens',
  trend: 'whether it is getting better, worse or staying the same',
};

export const emptyAshaState = (): AshaState => ({ symptoms: {}, order: [], otherSymptoms: [], notes: [] });

export function labelFor(name: SymptomName): string {
  return SYMPTOM_DEFINITIONS.find(d => d.name === name)?.label ?? name;
}

export function mergeSymptom(state: AshaState, name: SymptomName, detail: AshaDetail): AshaState {
  const existing = state.symptoms[name] ?? {};
  const cleaned = Object.fromEntries(Object.entries(detail).filter(([, v]) => v)) as AshaDetail;
  return {
    ...state,
    symptoms: { ...state.symptoms, [name]: { ...existing, ...cleaned } },
    order: state.order.includes(name) ? state.order : [...state.order, name],
  };
}

/** Set or clear one detail (the summary's "Not sure" clears it) */
export function setDetail(state: AshaState, name: SymptomName, field: AshaDetailField, value: string | undefined): AshaState {
  const next = { ...(state.symptoms[name] ?? {}) } as Record<string, string | undefined>;
  if (value) next[field] = value; else delete next[field];
  return { ...state, symptoms: { ...state.symptoms, [name]: next as AshaDetail } };
}

export function addOtherSymptom(state: AshaState, text: string): AshaState {
  const t = text.trim();
  if (!t || state.otherSymptoms.some(o => o.toLowerCase() === t.toLowerCase())) return state;
  return { ...state, otherSymptoms: [...state.otherSymptoms, t] };
}

export function addNote(state: AshaState, text: string): AshaState {
  const t = text.trim();
  if (!t || state.notes.includes(t)) return state;
  return { ...state, notes: [...state.notes, t] };
}

export function removeSymptom(state: AshaState, name: SymptomName): AshaState {
  const symptoms = { ...state.symptoms };
  delete symptoms[name];
  return { ...state, symptoms, order: state.order.filter(n => n !== name) };
}

export function missingFields(detail: AshaDetail | undefined): AshaDetailField[] {
  return DETAIL_FIELDS.filter(f => !detail?.[f]);
}

export function hasAnything(state: AshaState): boolean {
  return state.order.length > 0 || state.otherSymptoms.length > 0 || state.notes.length > 0;
}

/** Short, model-readable description of progress, used to steer the next question */
export function progressForModel(state: AshaState): string {
  if (!hasAnything(state)) return 'Nothing recorded yet.';
  const lines = state.order.map(name => {
    const d = state.symptoms[name] ?? {};
    const known = DETAIL_FIELDS.filter(f => d[f]).map(f => `${f}: ${d[f]}`).join(', ') || 'no details yet';
    const missing = missingFields(d).map(f => FIELD_QUESTIONS[f]);
    return `- ${labelFor(name)} (${known})${missing.length ? `; still unknown: ${missing.join(', ')}` : '; complete'}`;
  });
  if (state.otherSymptoms.length) lines.push(`- Other things mentioned: ${state.otherSymptoms.join('; ')}`);
  if (state.notes.length) lines.push(`- Notes for the care team: ${state.notes.join('; ')}`);
  return lines.join('\n');
}

/**
 * What Live Asha hears back after a silent save: only what is still unknown, and how to carry on.
 * Keeps her to one question at a time and stops her narrating the paperwork.
 */
export function toolReply(state: AshaState, name?: SymptomName) {
  const stillUnknown = name ? missingFields(state.symptoms[name]).map(f => FIELD_QUESTIONS[f]) : [];
  return {
    recorded: true,
    still_unknown_for_this_symptom: stillUnknown,
    guidance: stillUnknown.length
      ? 'Recorded silently. Carry on naturally: respond to what they said, then ask at most ONE gentle question about one unknown item. Do not mention recording.'
      : 'Recorded silently. This symptom is complete. Carry on naturally; ask if there is anything else they have noticed. Do not mention recording.',
  };
}

/** Hand Asha's findings to the existing check-in form state */
export function toCheckInForm(state: AshaState) {
  return {
    selected: new Set<SymptomName>(state.order),
    details: Object.fromEntries(state.order.map(n => [n, { ...state.symptoms[n] }])) as Record<SymptomName, Partial<SymptomEntry>>,
    associated: state.otherSymptoms.join(', '),
    notes: state.notes.join(' '),
  };
}
