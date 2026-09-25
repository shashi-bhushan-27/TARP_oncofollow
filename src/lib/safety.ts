// =============================================
// OncoFollow — Safety Module
// Red-flag detection, disclaimer injection, and safety rules
// =============================================

import { RoutingPriority, SymptomEntry, SymptomName } from '@/types';

// Emergency signs, in plain words. Asha's instructions are built from this same list
// (src/lib/asha/prompt.ts) so the code-level check and what Asha says never drift apart.
export const EMERGENCY_SIGNS = [
  'trouble breathing', 'sudden or severe chest pain', 'heavy bleeding that will not stop',
  'coughing or vomiting blood', 'fainting or losing consciousness', 'new confusion',
  'a seizure', 'sudden weakness or being unable to move or walk', 'losing control of bladder or bowels',
];

// Hard-coded red flags — these ALWAYS trigger EMERGENCY.
// English phrases match on word boundaries; phrases in Indian languages match as written.
// A model-based check (src/lib/asha/safetyCheck.ts) covers wording not listed here.
const IMMEDIATE_EMERGENCY_KEYWORDS: string[] = [
  // Breathing
  'severe shortness of breath', 'cannot breathe', 'can\'t breathe', 'cant breathe', 'gasping',
  'trouble breathing', 'difficulty breathing', 'struggling to breathe', 'hard to breathe',
  // Chest pain
  'severe chest pain', 'crushing chest pain', 'sudden chest pain',
  // Bleeding
  'coughing blood', 'coughing up blood', 'hemoptysis', 'blood in cough', 'blood in sputum',
  'vomiting blood', 'blood in vomit', 'heavy bleeding', 'severe bleeding', 'bleeding heavily',
  'bleeding won\'t stop', 'bleeding will not stop', 'bleeding that won\'t stop', 'bleeding that will not stop',
  // Seizures, consciousness, confusion
  'seizure', 'seizures', 'convulsion', 'convulsions', 'fits',
  'fainting', 'fainted', 'syncope', 'lost consciousness', 'passed out', 'unconscious',
  'confusion', 'disoriented', 'altered consciousness', 'not making sense',
  // Neurological
  'sudden weakness', 'paralysis', 'cannot move', 'can\'t move',
  'spinal cord', 'unable to walk', 'bladder control', 'bowel control',
  // Hindi (Devanagari)
  'सांस नहीं', 'साँस नहीं', 'सांस लेने में तकलीफ', 'साँस लेने में तकलीफ', 'दौरा पड़', 'मिर्गी',
  'बेहोश', 'होश नहीं', 'खून की उल्टी', 'खांसी में खून', 'खाँसी में खून', 'बहुत खून बह',
  'सीने में तेज दर्द', 'सीने में तेज़ दर्द',
  // Hindi (romanised)
  'saans nahi', 'sans nahi', 'behosh', 'daura pada', 'mirgi', 'khoon ki ulti', 'khansi mein khoon', 'seene mein tez dard',
  // Marathi
  'बेशुद्ध', 'श्वास घेता येत नाही', 'रक्ताची उलटी', 'फिट आली', 'छातीत तीव्र वेदना',
  // Tamil
  'மூச்சு விட முடியவில்லை', 'வலிப்பு', 'இரத்த வாந்தி', 'சுயநினைவு இழந்',
  // Bengali
  'শ্বাস নিতে পারছি না', 'খিঁচুনি', 'অজ্ঞান', 'রক্ত বমি',
  // Telugu
  'ఊపిరి ఆడటం లేదు', 'మూర్ఛ',
];

const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** English phrases match whole words ("fits" must not match "benefits"); other scripts match as written */
function containsPhrase(lowerText: string, phrase: string): boolean {
  if (!isAscii(phrase)) return lowerText.includes(phrase);
  return new RegExp(`(^|[^a-z])${escapeRegex(phrase)}($|[^a-z])`).test(lowerText);
}

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

const SEVERE_COMBINATION_FLAGS: Array<{ symptoms: SymptomName[], level: RoutingPriority }> = [
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
  // False reassurance and forced positivity (see docs/asha-playbook.md)
  'you will be fine',
  'you\'ll be fine',
  'it\'s probably nothing',
  'it is probably nothing',
  'everything happens for a reason',
  'I know exactly how you feel',
];

// Diagnostic or clinical claims: if Asha ever says one of these, the live session ends
const ASHA_CRITICAL_PHRASES: string[] = [
  'definitely not cancer', 'definitely benign', 'i can diagnose', 'you do not need a doctor',
  'you don\'t need a doctor', 'no need to see a doctor', 'cancer has come back', 'cancer is back',
  'it is not cancer', 'it\'s not cancer', 'you should stop taking', 'you should take', 'increase your dose',
  'reduce your dose', 'you need a scan', 'you need a ct', 'you need an mri',
  // Hindi
  'कैंसर वापस आ गया', 'कैंसर नहीं है', 'डॉक्टर की ज़रूरत नहीं', 'डॉक्टर की जरूरत नहीं', 'दवा बंद कर', 'दवा लेना बंद',
];

// Tone problems: flagged for care-team review but the conversation continues,
// because some can appear innocently ("it's okay not to stay positive all the time")
const ASHA_TONE_PHRASES: string[] = [
  'nothing to worry about', 'you\'ll be fine', 'you will be fine', 'you are fine', 'you\'re fine',
  'it\'s probably nothing', 'it is probably nothing', 'stay positive', 'everything happens for a reason',
  'i know exactly how you feel', 'don\'t worry',
  // Hindi
  'चिंता की कोई बात नहीं', 'आप ठीक हो जाएंगे', 'आप ठीक हो जाएंगी', 'आप ठीक हो जाएँगी',
];

/**
 * Fast phrase check of what Asha said (live transcript or text reply).
 * Wording in other languages that is not listed here is caught by the model-based
 * review in src/lib/asha/safetyCheck.ts.
 */
export function checkAshaSpeech(text: string): { critical?: string; tone?: string } {
  const lower = text.toLowerCase().replace(/[’‘]/g, '\'');
  return {
    critical: ASHA_CRITICAL_PHRASES.find(p => containsPhrase(lower, p)),
    tone: ASHA_TONE_PHRASES.find(p => containsPhrase(lower, p)),
  };
}

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
  const lowerText = text.toLowerCase().replace(/[’‘]/g, '\'');
  const triggers: string[] = [];
  let isEmergency = false;
  let isUrgent = false;

  for (const keyword of IMMEDIATE_EMERGENCY_KEYWORDS) {
    if (containsPhrase(lowerText, keyword)) {
      isEmergency = true;
      triggers.push(`Emergency keyword: "${keyword}"`);
    }
  }

  for (const keyword of URGENT_KEYWORDS) {
    if (containsPhrase(lowerText, keyword)) {
      isUrgent = true;
      triggers.push(`Escalation keyword: "${keyword}"`);
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
      triggers.push(`Emergency-list symptom: ${symptom.label}`);
    }

    // Severe + worsening = escalate
    if (symptom.severity === 'severe' && symptom.trend === 'worsening') {
      isUrgent = true;
      triggers.push(`Patient marked severe and getting worse: ${symptom.label}`);
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
      triggers.push(`Escalation rule matched: ${combo.symptoms.join(' + ')}`);
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
export function ensureDisclaimer(text: string, urgency: RoutingPriority): string {
  const disclaimer = urgency === 'emergency' ? EMERGENCY_DISCLAIMER : SAFETY_DISCLAIMER;
  if (!text.includes('does not replace')) {
    return `${text}\n\n---\n*${disclaimer}*`;
  }
  return text;
}

/**
 * Determine the final routing priority from all signals
 */
export function resolveRoutingPriority(
  textFlags: { isEmergency: boolean; isUrgent: boolean },
  symptomFlags: { isEmergency: boolean; isUrgent: boolean },
  baseRouting: RoutingPriority
): RoutingPriority {
  if (textFlags.isEmergency || symptomFlags.isEmergency) return 'emergency';
  if (textFlags.isUrgent || symptomFlags.isUrgent) return 'urgent';
  return baseRouting;
}
