// =============================================
// Asha — Live API tool declarations
// Asha records the check-in through these functions; the browser validates every
// value with src/lib/asha/normalize.ts before it reaches the form.
// =============================================

import { FunctionDeclaration, Type } from '@google/genai';
import { DURATIONS, FREQUENCIES, SEVERITIES, SYMPTOM_NAMES, TRENDS } from './normalize';
import { EMERGENCY_SIGNS } from '@/lib/safety';

export const ASHA_TOOLS: FunctionDeclaration[] = [
  {
    name: 'save_symptom',
    description: 'Silently record what the person said about one symptom. Call again as more details come up.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symptom: { type: Type.STRING, enum: SYMPTOM_NAMES, description: 'Closest matching symptom' },
        severity: { type: Type.STRING, enum: SEVERITIES, description: 'How strong, in their own judgement' },
        duration: { type: Type.STRING, enum: [...DURATIONS], description: 'How long it has been going on' },
        frequency: { type: Type.STRING, enum: FREQUENCIES, description: 'How often it happens' },
        trend: { type: Type.STRING, enum: TRENDS, description: 'Getting better, same, or worse' },
      },
      required: ['symptom'],
    },
  },
  {
    name: 'other_symptom',
    description: 'Record something they noticed that is not in the symptom list.',
    parameters: {
      type: Type.OBJECT,
      properties: { description: { type: Type.STRING, description: 'In plain English' } },
      required: ['description'],
    },
  },
  {
    name: 'save_note',
    description: 'Record anything else they want their care team to know, in their own words translated to English.',
    parameters: {
      type: Type.OBJECT,
      properties: { text: { type: Type.STRING } },
      required: ['text'],
    },
  },
  {
    name: 'flag_emergency',
    description: `Call immediately if they mention an emergency sign: ${EMERGENCY_SIGNS.join(', ')}.`,
    parameters: {
      type: Type.OBJECT,
      properties: { what_they_said: { type: Type.STRING } },
      required: ['what_they_said'],
    },
  },
  {
    name: 'finish_check_in',
    description: 'Call after they confirm your summary, or when they want to stop.',
    parameters: {
      type: Type.OBJECT,
      properties: { reason: { type: Type.STRING, enum: ['confirmed', 'wants_to_stop'] } },
      required: ['reason'],
    },
  },
];
