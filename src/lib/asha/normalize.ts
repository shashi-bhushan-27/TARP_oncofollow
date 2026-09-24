// =============================================
// Asha — value normalisation
// Maps whatever the model returns onto the exact values the check-in form accepts.
// Anything that does not map cleanly is dropped, never guessed.
// =============================================

import { Frequency, Severity, SymptomName, Trend, SYMPTOM_DEFINITIONS } from '@/types';
import { AshaDetail } from './slots';

export const SYMPTOM_NAMES = SYMPTOM_DEFINITIONS.map(d => d.name) as SymptomName[];
export const SEVERITIES: Severity[] = ['mild', 'moderate', 'severe'];
export const FREQUENCIES: Frequency[] = ['occasional', 'frequent', 'constant'];
export const TRENDS: Trend[] = ['improving', 'stable', 'worsening'];
export const DURATIONS = ['1-2 days', '3-5 days', '1 week', '2 weeks', '3 weeks', '1 month+'] as const;

const SYMPTOM_ALIASES: Record<string, SymptomName> = {
  tired: 'fatigue', tiredness: 'fatigue', exhaustion: 'fatigue', exhausted: 'fatigue', 'no energy': 'fatigue',
  'short of breath': 'breathlessness', 'shortness of breath': 'breathlessness', breathless: 'breathlessness', dyspnea: 'breathlessness',
  'chest pain': 'chest_pain', 'chest discomfort': 'chest_pain',
  'back pain': 'bone_pain', 'joint pain': 'bone_pain', 'bone pain': 'bone_pain',
  vomiting: 'nausea', 'feeling sick': 'nausea',
  temperature: 'fever', chills: 'fever',
  lump: 'swelling', 'new lump': 'swelling',
  'loss of appetite': 'appetite_loss', 'not hungry': 'appetite_loss', 'appetite loss': 'appetite_loss',
  'weight loss': 'weight_loss', 'losing weight': 'weight_loss',
  dizzy: 'dizziness', lightheaded: 'dizziness', vertigo: 'dizziness',
  weak: 'weakness',
  'blurred vision': 'vision_changes', 'vision changes': 'vision_changes', 'vision problems': 'vision_changes',
  confused: 'confusion',
  seizure: 'seizures', fits: 'seizures',
  'coughing blood': 'hemoptysis', 'blood in cough': 'hemoptysis', 'blood in sputum': 'hemoptysis',
  rash: 'skin_changes', 'skin changes': 'skin_changes',
  'swollen lymph nodes': 'lymph_swelling', 'lymph node swelling': 'lymph_swelling', 'swollen glands': 'lymph_swelling',
  tingling: 'numbness', 'pins and needles': 'numbness', numb: 'numbness',
};

const clean = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

export function normalizeSymptom(value: unknown): SymptomName | undefined {
  const v = clean(value).replace(/[-\s]+/g, ' ');
  if (!v) return undefined;
  const asId = v.replace(/ /g, '_') as SymptomName;
  if (SYMPTOM_NAMES.includes(asId)) return asId;
  const byLabel = SYMPTOM_DEFINITIONS.find(d => d.label.toLowerCase() === v);
  if (byLabel) return byLabel.name;
  return SYMPTOM_ALIASES[v];
}

export function normalizeSeverity(value: unknown): Severity | undefined {
  const v = clean(value);
  if (!v) return undefined;
  if ((SEVERITIES as string[]).includes(v)) return v as Severity;
  if (/(unbearable|severe|very bad|terrible|worst|a lot|extreme)/.test(v)) return 'severe';
  if (/(moderate|medium|quite|fairly|noticeable)/.test(v)) return 'moderate';
  if (/(mild|slight|a little|a bit|minor|light)/.test(v)) return 'mild';
  return undefined;
}

export function normalizeFrequency(value: unknown): Frequency | undefined {
  const v = clean(value);
  if (!v) return undefined;
  if ((FREQUENCIES as string[]).includes(v)) return v as Frequency;
  if (/(constant|all the time|always|all day|non.?stop|continuous)/.test(v)) return 'constant';
  if (/(frequent|often|most days|many times|several times|daily|every day)/.test(v)) return 'frequent';
  if (/(occasional|now and then|sometimes|once in a while|rarely|comes and goes)/.test(v)) return 'occasional';
  return undefined;
}

export function normalizeTrend(value: unknown): Trend | undefined {
  const v = clean(value);
  if (!v) return undefined;
  if ((TRENDS as string[]).includes(v)) return v as Trend;
  if (/(worse|worsening|increasing|getting bad)/.test(v)) return 'worsening';
  if (/(better|improving|less|easing|going away)/.test(v)) return 'improving';
  if (/(same|stable|no change|unchanged|steady)/.test(v)) return 'stable';
  return undefined;
}

/** Duration phrases → the form's buckets ("since last Tuesday" is left to the model to express in days/weeks) */
export function normalizeDuration(value: unknown): string | undefined {
  const v = clean(value);
  if (!v) return undefined;
  if ((DURATIONS as readonly string[]).includes(v)) return v;
  if (/(month|months|long time)/.test(v)) return '1 month+';
  const words: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, few: 3, couple: 2 };
  const m = v.match(/(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|few|couple)\s*(?:of\s*)?(day|days|week|weeks)/);
  if (m) {
    const n = Number(m[1]) || words[m[1]] || 1;
    const days = m[2].startsWith('week') ? n * 7 : n;
    if (days <= 2) return '1-2 days';
    if (days <= 5) return '3-5 days';
    if (days <= 10) return '1 week';
    if (days <= 17) return '2 weeks';
    if (days <= 27) return '3 weeks';
    return '1 month+';
  }
  if (/(yesterday|today|since last night)/.test(v)) return '1-2 days';
  if (/(last week|a week)/.test(v)) return '1 week';
  return undefined;
}

export function normalizeDetail(raw: Record<string, unknown>): AshaDetail {
  return {
    severity: normalizeSeverity(raw.severity),
    duration: normalizeDuration(raw.duration),
    frequency: normalizeFrequency(raw.frequency),
    trend: normalizeTrend(raw.trend),
  };
}
