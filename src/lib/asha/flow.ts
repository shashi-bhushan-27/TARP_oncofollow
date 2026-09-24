// =============================================
// Asha — conversation planner
// Code decides WHAT Asha does next; the model only decides HOW to say it.
// Enforces the playbook: never ask the same thing twice, at most two follow-ups
// per symptom, feelings before questions, then summarise → confirm → close.
// =============================================

import { SymptomName } from '@/types';
import {
  AshaDetailField, AshaState, FIELD_QUESTIONS, hasAnything, labelFor, missingFields,
} from './slots';

export type AshaStage = 'opening' | 'gathering' | 'anything_else' | 'confirming' | 'done';

export interface AshaFlow {
  stage: AshaStage;
  asked: Partial<Record<SymptomName, AshaDetailField[]>>;  // each detail is asked about at most once
  confirmAttempts: number;
}

export const emptyFlow = (): AshaFlow => ({ stage: 'opening', asked: {}, confirmAttempts: 0 });

// Natural order a person would talk through a symptom
const FIELD_ORDER: AshaDetailField[] = ['duration', 'trend', 'frequency', 'severity'];
const MAX_FOLLOW_UPS = 2;

export interface TurnSignals {
  newInfo: boolean;          // this message added a symptom, detail or note
  strongEmotion: boolean;    // worry, fear, sadness, frustration
  wantsToStop: boolean;
  affirmed: boolean;         // "yes, that's right"
  nothingMore: boolean;      // "no, that's everything"
}

/** Plain-English summary of what will be passed on; Asha says it in the person's language */
export function summaryForModel(state: AshaState): string {
  if (!hasAnything(state)) return 'Nothing new to report since the last visit.';
  const parts = state.order.map(name => {
    const d = state.symptoms[name] ?? {};
    const bits = [
      d.duration && `for about ${d.duration.replace('1 month+', 'a month or more').replace('1-2 days', '1 to 2 days').replace('3-5 days', '3 to 5 days')}`,
      d.frequency && { occasional: 'comes and goes', frequent: 'happens often', constant: 'there most of the time' }[d.frequency],
      d.trend && { improving: 'getting better', stable: 'about the same', worsening: 'getting worse' }[d.trend],
      d.severity && `${d.severity}`,
    ].filter(Boolean);
    return `${labelFor(name).toLowerCase()}${bits.length ? ` (${bits.join(', ')})` : ''}`;
  });
  if (state.otherSymptoms.length) parts.push(...state.otherSymptoms);
  const notes = state.notes.length ? ` Also for the team: ${state.notes.join('; ')}.` : '';
  return `${parts.join('; ')}.${notes}`;
}

function nextAsk(state: AshaState, flow: AshaFlow): { symptom: SymptomName; field: AshaDetailField } | null {
  for (const symptom of state.order) {
    const asked = flow.asked[symptom] ?? [];
    if (asked.length >= MAX_FOLLOW_UPS) continue;
    const missing = missingFields(state.symptoms[symptom]);
    const field = FIELD_ORDER.find(f => missing.includes(f) && !asked.includes(f));
    if (field) return { symptom, field };
  }
  return null;
}

const FEELINGS_FIRST = 'If their latest message shows worry, fear, sadness or frustration, respond only to that feeling this turn and ask nothing else.';

/** Decide Asha's next move after the latest message has been merged into state */
export function planNextMove(state: AshaState, flow: AshaFlow, s: TurnSignals): { flow: AshaFlow; instruction: string; done: boolean } {
  const f: AshaFlow = { ...flow, asked: { ...flow.asked } };
  const close = (why: string) => ({
    flow: { ...f, stage: 'done' as const },
    instruction: `${why} Thank them warmly, tell them their care team will see this, and that they can talk to you any time. Say goodbye. Do not ask any question.`,
    done: true,
  });

  if (s.wantsToStop) {
    return close(`They want to stop. Briefly say what you will pass on: ${summaryForModel(state)}`);
  }

  if (f.stage === 'opening') {
    f.stage = 'gathering';
    if (!s.newInfo) {
      return {
        flow: f,
        instruction: 'Greet them by first name, say in one line that you are Asha from their care team\'s follow-up service, and ask one open question: how have things been since their last visit?',
        done: false,
      };
    }
  }

  if (f.stage === 'confirming') {
    if (s.affirmed && !s.newInfo) return close('They confirmed your summary.');
    f.confirmAttempts += 1;
    if (f.confirmAttempts >= 2) return close('Acknowledge the correction.');
    return {
      flow: f,
      instruction: `They corrected or added something. Acknowledge it, then briefly summarise again what you will pass on and ask if it is right now: ${summaryForModel(state)}`,
      done: false,
    };
  }

  if (f.stage === 'anything_else' && !s.newInfo) {
    f.stage = 'confirming';
    return {
      flow: f,
      instruction: `Summarise in plain, warm words what you will pass on to their care team, then ask if you got it right: ${summaryForModel(state)}`,
      done: false,
    };
  }

  // Gathering: pick the single most useful missing detail, never repeating a question
  f.stage = 'gathering';
  const ask = s.strongEmotion ? null : nextAsk(state, f);
  if (s.strongEmotion) {
    return { flow: f, instruction: `${FEELINGS_FIRST} Name the feeling gently, show you understand, and offer support.`, done: false };
  }
  if (ask) {
    f.asked[ask.symptom] = [...(f.asked[ask.symptom] ?? []), ask.field];
    return {
      flow: f,
      instruction: `Reflect back briefly what they just said, then gently ask about ${FIELD_QUESTIONS[ask.field]} — their ${labelFor(ask.symptom).toLowerCase()}. One question only, in everyday words.`,
      done: false,
    };
  }

  f.stage = 'anything_else';
  return {
    flow: f,
    instruction: hasAnything(state)
      ? 'Respond warmly to what they said, then ask if there is anything else they have noticed or would like their care team to know. Do not ask any other question.'
      : 'Respond warmly to what they said, then gently ask if they have noticed anything new or different in their health, or anything they would like their care team to know. Do not ask any other question.',
    done: false,
  };
}
