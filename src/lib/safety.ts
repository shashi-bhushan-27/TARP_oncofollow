// =============================================
// OncoFollow — Safety Module
// Red-flag detection, disclaimer injection, and safety rules
// =============================================

import { UrgencyLevel, SymptomEntry, SymptomName } from '@/types';

// Hard-coded red flags — these ALWAYS trigger EMERGENCY
const IMMEDIATE_EMERGENCY_KEYWORDS: string[] = [
  'coughing blood', 'hemoptysis', 'blood in cough', 'blood in sputum',
  'severe shortness of breath', 'cannot breathe', 'can\'t breathe', 'gasping',
  'seizure', 'seizures', 'convulsion', 'convulsions', 'fits',
  'sudden weakness', 'paralysis', 'cannot move', 'can\'t move',
  'confusion', 'disoriented', 'altered consciousness', 'not making sense',
  'severe chest pain', 'crushing chest pain',
  'fainting', 'fainted', 'syncope', 'lost consciousness', 'passed out',
  'spinal cord', 'unable to walk', 'bladder control', 'bowel control',
];

const URGENT_KEYWORDS: string[] = [
  'high fever', 'fever 103', 'fever 104', 'fever 39', 'fever 40',
  'rapidly worsening', 'getting much worse', 'quickly getting worse',
  'severe bone pain', 'can\'t move because of pain',
  'severe headache', 'worst headache',
  'significant weight loss', 'lost a lot of weight',
  'jaundice', 'yellow skin', 'yellow eyes',
];

// Symptom names that are red flags
const RED_FLAG_SYMPTOMS: SymptomName[] = [
  'hemoptysis', 'seizures', 'confusion',
];

const SEVERE_COMBINATION_FLAGS: Array<{ symptoms: SymptomName[], level: UrgencyLevel }> = [
  { symptoms: ['headache', 'vision_changes'], level: 'emergency' },
  { symptoms: ['headache', 'confusion'], level: 'emergency' },
  { symptoms: ['weakness', 'numbness'], level: 'urgent' },
  { symptoms: ['breathlessness', 'chest_pain'], level: 'urgent' },
  { symptoms: ['bone_pain', 'weakness'], level: 'soon' },
];

// Phrases the system must NEVER output
const BLOCKED_PHRASES: string[] = [
  'you do not need a doctor',
  'you don\'t need a doctor',
  'no need to see a doctor',
  'nothing to worry about',
  'you are fine',
  'you\'re fine',
  'no cause for concern',
  'definitely not cancer',
  'definitely benign',
  'I can confirm',
  'I can diagnose',
];

export const SAFETY_DISCLAIMER = 'This tool is for follow-up support and does not replace a doctor\'s diagnosis. Please consult your healthcare team for any medical concerns.';

export const EMERGENCY_DISCLAIMER = 'This tool is for follow-up support and does not replace a doctor\'s diagnosis. PLEASE SEEK IMMEDIATE EMERGENCY CARE.';

/**
 * Scan free text for emergency red flags
 */
export function scanForRedFlags(text: string): {
  isEmergency: boolean;
  isUrgent: boolean;
  triggers: string[];
} {
  const lowerText = text.toLowerCase();
  const triggers: string[] = [];
  let isEmergency = false;
  let isUrgent = false;

  for (const keyword of IMMEDIATE_EMERGENCY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      isEmergency = true;
      triggers.push(keyword);
    }
  }

  for (const keyword of URGENT_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      isUrgent = true;
      triggers.push(keyword);
    }
  }

  return { isEmergency, isUrgent, triggers };
}

/**
 * Check structured symptoms for red flags
 */
export function scanSymptomsForRedFlags(symptoms: SymptomEntry[]): {
  isEmergency: boolean;
  isUrgent: boolean;
  triggers: string[];
} {
  const triggers: string[] = [];
  let isEmergency = false;
  let isUrgent = false;

  // Check individual red-flag symptoms
  for (const symptom of symptoms) {
    if (RED_FLAG_SYMPTOMS.includes(symptom.name)) {
      isEmergency = true;
      triggers.push(`Red flag symptom: ${symptom.label}`);
    }

    // Severe + worsening = escalate
    if (symptom.severity === 'severe' && symptom.trend === 'worsening') {
      isUrgent = true;
      triggers.push(`Severe and worsening: ${symptom.label}`);
    }
  }

  // Check combinations
  const symptomNames = symptoms.map(s => s.name);
  for (const combo of SEVERE_COMBINATION_FLAGS) {
    const hasAll = combo.symptoms.every(s => symptomNames.includes(s));
    if (hasAll) {
      if (combo.level === 'emergency') {
        isEmergency = true;
      } else {
        isUrgent = true;
      }
      triggers.push(`Concerning combination: ${combo.symptoms.join(' + ')}`);
    }
  }

  return { isEmergency, isUrgent, triggers };
}

/**
 * Sanitize output — remove any blocked phrases
 */
export function sanitizeOutput(text: string): string {
  let sanitized = text;
  for (const phrase of BLOCKED_PHRASES) {
    const regex = new RegExp(phrase, 'gi');
    sanitized = sanitized.replace(regex, '[Statement removed for safety]');
  }
  return sanitized;
}

/**
 * Ensure disclaimer is appended
 */
export function ensureDisclaimer(text: string, urgency: UrgencyLevel): string {
  const disclaimer = urgency === 'emergency' ? EMERGENCY_DISCLAIMER : SAFETY_DISCLAIMER;
  if (!text.includes('does not replace')) {
    return `${text}\n\n---\n⚕️ *${disclaimer}*`;
  }
  return text;
}

/**
 * Determine overall urgency from all signals
 */
export function resolveUrgency(
  textFlags: { isEmergency: boolean; isUrgent: boolean },
  symptomFlags: { isEmergency: boolean; isUrgent: boolean },
  baseUrgency: UrgencyLevel
): UrgencyLevel {
  if (textFlags.isEmergency || symptomFlags.isEmergency) return 'emergency';
  if (textFlags.isUrgent || symptomFlags.isUrgent) return 'urgent';
  return baseUrgency;
}
