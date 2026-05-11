// =============================================
// OncoFollow — Triage Engine
// Rule-based triage combining symptoms, history, and guidelines
// =============================================

import {
  SymptomEntry, TriageResult, Citation, UrgencyLevel,
  Patient, UploadedDocument
} from '@/types';
import {
  scanForRedFlags, scanSymptomsForRedFlags, resolveUrgency,
  SAFETY_DISCLAIMER, EMERGENCY_DISCLAIMER
} from './safety';

interface TriageInput {
  symptoms: SymptomEntry[];
  freeText: string;
  associatedSymptoms: string;
  patient: Patient;
  recentDocuments: UploadedDocument[];
}

// Symptom → cancer concern mapping
const CANCER_CONCERN_MAP: Record<string, {
  concern: string;
  possibleSite: string;
  suggestedTests: string[];
  guidelineSnippet: string;
}> = {
  cough: {
    concern: 'Persistent cough in a breast cancer survivor may indicate pulmonary involvement',
    possibleSite: 'Lung',
    suggestedTests: ['Chest X-ray', 'CT Chest with contrast', 'Tumor markers (CA 15-3, CEA)'],
    guidelineSnippet: 'New persistent respiratory symptoms in breast cancer survivors should prompt chest imaging [NCCN Survivorship Guidelines]',
  },
  breathlessness: {
    concern: 'Dyspnea may indicate pleural effusion, pulmonary involvement, or cardiac effects of treatment',
    possibleSite: 'Lung/Pleura',
    suggestedTests: ['Chest X-ray', 'CT Chest', 'Echocardiogram', 'Pulmonary function tests'],
    guidelineSnippet: 'Evaluate for pulmonary metastasis, pleural effusion, and treatment-related cardiac toxicity [NCCN]',
  },
  chest_pain: {
    concern: 'Chest discomfort warrants evaluation, especially in context of prior chest radiation or chemotherapy',
    possibleSite: 'Chest wall/Lung',
    suggestedTests: ['Chest X-ray', 'ECG', 'Echocardiogram if cardiac concern'],
    guidelineSnippet: 'Chest wall pain may be post-radiation or musculoskeletal. New/progressive pain needs evaluation [ASCO]',
  },
  bone_pain: {
    concern: 'New bone pain in a breast cancer survivor, especially in the spine, pelvis, or ribs, raises concern for bone metastasis',
    possibleSite: 'Bone',
    suggestedTests: ['Bone scan', 'PET-CT', 'Serum calcium', 'Alkaline phosphatase', 'Tumor markers'],
    guidelineSnippet: 'Bone is the most common site of breast cancer metastasis (40-75% of metastatic cases) [ASCO]',
  },
  headache: {
    concern: 'Persistent or severe headache may indicate CNS involvement, especially if associated with neurological symptoms',
    possibleSite: 'Brain',
    suggestedTests: ['MRI Brain with contrast', 'Neurological examination', 'Ophthalmologic assessment'],
    guidelineSnippet: 'Neurological symptoms require brain MRI to rule out CNS metastasis [NCCN]',
  },
  fatigue: {
    concern: 'Fatigue is common in survivors but persistent worsening fatigue should be evaluated for underlying causes',
    possibleSite: 'Systemic',
    suggestedTests: ['CBC', 'Thyroid function', 'Metabolic panel', 'Vitamin D/B12'],
    guidelineSnippet: 'Screen for treatable causes: anemia, thyroid dysfunction, depression [NCCN CRF Guidelines]',
  },
  weight_loss: {
    concern: 'Unexplained weight loss (>5% in 6 months) may be a sign of disease activity',
    possibleSite: 'Systemic',
    suggestedTests: ['CT Chest/Abdomen/Pelvis', 'PET-CT', 'Tumor markers', 'Complete metabolic panel'],
    guidelineSnippet: 'Significant unexplained weight loss warrants comprehensive evaluation for recurrence [ASCO]',
  },
  fever: {
    concern: 'Persistent fever without clear infection source should be evaluated',
    possibleSite: 'Systemic',
    suggestedTests: ['CBC with differential', 'Blood cultures', 'CT Chest/Abdomen', 'Urinalysis'],
    guidelineSnippet: 'Persistent fever >103°F for >24 hours is an urgent symptom requiring evaluation [Emergency Oncology Reference]',
  },
  vision_changes: {
    concern: 'Visual changes may indicate CNS involvement or treatment-related effects',
    possibleSite: 'Brain/Orbit',
    suggestedTests: ['MRI Brain with contrast', 'Ophthalmologic examination', 'Visual field testing'],
    guidelineSnippet: 'Visual symptoms in cancer survivors require urgent neurological and ophthalmological evaluation [NCCN]',
  },
};

/**
 * Calculate base urgency from symptoms
 */
function calculateBaseUrgency(symptoms: SymptomEntry[]): UrgencyLevel {
  let maxScore = 0;

  for (const symptom of symptoms) {
    let score = 0;

    // Severity scoring
    if (symptom.severity === 'severe') score += 3;
    else if (symptom.severity === 'moderate') score += 2;
    else score += 1;

    // Duration scoring
    if (symptom.duration.includes('day') && parseInt(symptom.duration) <= 2) score += 1;
    else if (symptom.duration.includes('week')) score += 2;
    else if (symptom.duration.includes('month')) score += 3;

    // Frequency scoring
    if (symptom.frequency === 'constant') score += 2;
    else if (symptom.frequency === 'frequent') score += 1;

    // Trend scoring
    if (symptom.trend === 'worsening') score += 2;
    else if (symptom.trend === 'stable') score += 1;

    maxScore = Math.max(maxScore, score);
  }

  // Multiple symptoms increase urgency
  if (symptoms.length >= 3) maxScore += 2;
  else if (symptoms.length >= 2) maxScore += 1;

  if (maxScore >= 8) return 'urgent';
  if (maxScore >= 5) return 'soon';
  return 'routine';
}

/**
 * Generate explanation based on symptoms and patient context
 */
function generateExplanation(
  symptoms: SymptomEntry[],
  patient: Patient,
  urgency: UrgencyLevel,
  recentDocs: UploadedDocument[]
): string {
  const symptomNames = symptoms.map(s => s.label).join(', ');
  const cancerContext = `Stage ${patient.cancerStage} breast cancer (${patient.receptorStatus.join('/')})`;
  const timeSinceTreatment = getTimeSinceTreatment(patient);

  if (urgency === 'emergency') {
    return `URGENT — Your reported symptoms (${symptomNames}) include red flag indicators that require immediate emergency evaluation. Given your ${cancerContext} history, these symptoms need to be assessed without delay.`;
  }

  if (urgency === 'urgent') {
    let explanation = `Your symptoms (${symptomNames}) in the context of your ${cancerContext} history (${timeSinceTreatment}) warrant prompt evaluation.`;
    const xrayDoc = recentDocs.find(d => d.reportType === 'xray' || d.reportType === 'ct_scan');
    if (xrayDoc && xrayDoc.keyFindings) {
      explanation += ` Your recent ${xrayDoc.reportType === 'xray' ? 'chest X-ray' : 'CT scan'} findings ("${xrayDoc.keyFindings.substring(0, 100)}...") add to the clinical concern.`;
    }
    return explanation;
  }

  if (urgency === 'soon') {
    return `Your symptoms (${symptomNames}) should be evaluated by your oncology team in the coming days. While these may have benign causes, your ${cancerContext} history makes clinical assessment important to ensure appropriate follow-up.`;
  }

  return `Your reported symptom(s) — ${symptomNames} — appear to be within the range of routine monitoring for a ${cancerContext} survivor (${timeSinceTreatment}). Continue your scheduled follow-up plan. If symptoms worsen or new symptoms develop, please report again promptly.`;
}

function getTimeSinceTreatment(patient: Patient): string {
  const lastTreatment = patient.treatmentHistory
    .filter(t => t.endDate)
    .sort((a, b) => new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime())[0];

  if (!lastTreatment?.endDate) return 'currently in treatment';

  const months = Math.floor((Date.now() - new Date(lastTreatment.endDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return 'recently completed treatment';
  if (months === 1) return '1 month post-treatment';
  return `${months} months post-treatment`;
}

/**
 * Build citations from patient documents and guidelines
 */
function buildCitations(
  symptoms: SymptomEntry[],
  recentDocs: UploadedDocument[]
): Citation[] {
  const citations: Citation[] = [];
  let recordIndex = 1;
  let guidelineIndex = 1;

  // Add document citations
  for (const doc of recentDocs.slice(0, 3)) {
    citations.push({
      id: `cite-r${recordIndex}`,
      label: `[R${recordIndex}]`,
      sourceType: 'record',
      sourceId: doc.id,
      sourceTitle: `${doc.reportType === 'xray' ? 'X-ray' : doc.reportType === 'blood_report' ? 'Blood Report' : doc.reportType} — ${doc.reportDate}`,
      snippet: doc.keyFindings || doc.impression || '',
      date: doc.reportDate,
    });
    recordIndex++;
  }

  // Add guideline citations based on symptoms
  const addedGuidelines = new Set<string>();
  for (const symptom of symptoms) {
    const concern = CANCER_CONCERN_MAP[symptom.name];
    if (concern && !addedGuidelines.has(concern.guidelineSnippet)) {
      addedGuidelines.add(concern.guidelineSnippet);
      citations.push({
        id: `cite-g${guidelineIndex}`,
        label: `[G${guidelineIndex}]`,
        sourceType: 'guideline',
        sourceId: `guideline-${guidelineIndex}`,
        sourceTitle: concern.guidelineSnippet.includes('NCCN') ? 'NCCN Survivorship Guidelines' : 'ASCO Follow-up Recommendations',
        snippet: concern.guidelineSnippet,
      });
      guidelineIndex++;
    }
  }

  return citations;
}

/**
 * Main triage function
 */
export function runTriage(input: TriageInput): TriageResult {
  const { symptoms, freeText, associatedSymptoms, patient, recentDocuments } = input;
  const allText = `${freeText} ${associatedSymptoms}`;

  // Step 1: Red-flag scan
  const textFlags = scanForRedFlags(allText);
  const symptomFlags = scanSymptomsForRedFlags(symptoms);

  // Step 2: Base urgency
  const baseUrgency = calculateBaseUrgency(symptoms);

  // Step 3: Resolve final urgency (red flags override everything)
  const urgency = resolveUrgency(textFlags, symptomFlags, baseUrgency);

  // Step 4: Collect all red-flag triggers
  const redFlagTriggers = [...textFlags.triggers, ...symptomFlags.triggers];

  // Step 5: Generate explanation
  const explanation = generateExplanation(symptoms, patient, urgency, recentDocuments);

  // Step 6: Collect recommended actions
  const recommendedActions = generateRecommendedActions(symptoms, urgency);

  // Step 7: Collect suggested tests
  const suggestedTests = collectSuggestedTests(symptoms, urgency);

  // Step 8: Build citations
  const citations = buildCitations(symptoms, recentDocuments);

  // Step 9: Determine confidence
  const confidenceBand = redFlagTriggers.length > 0 ? 'high' as const :
    symptoms.length >= 2 ? 'moderate' as const : 'moderate' as const;

  return {
    urgencyLevel: urgency,
    explanation,
    recommendedActions,
    suggestedTests,
    redFlagTriggers,
    confidenceBand,
    citations,
    disclaimer: urgency === 'emergency' ? EMERGENCY_DISCLAIMER : SAFETY_DISCLAIMER,
  };
}

function generateRecommendedActions(symptoms: SymptomEntry[], urgency: UrgencyLevel): string[] {
  if (urgency === 'emergency') {
    return [
      '🚨 Go to the nearest emergency department IMMEDIATELY',
      'Do NOT drive yourself — call an ambulance or have someone drive you',
      'Bring your cancer treatment records if readily available',
      'Inform the ER team about your breast cancer history',
    ];
  }

  if (urgency === 'urgent') {
    return [
      'Schedule an urgent appointment with your oncologist within the next few days',
      'Complete recommended imaging and blood work promptly',
      'Keep a daily log of your symptoms and any changes',
      'If symptoms suddenly worsen, go to the emergency department',
    ];
  }

  if (urgency === 'soon') {
    return [
      'Contact your oncologist to schedule an evaluation this week',
      'Complete recommended tests before your appointment if possible',
      'Monitor your symptoms and note any changes',
      'Report any worsening or new symptoms immediately',
    ];
  }

  return [
    'Continue your regular follow-up schedule',
    'Maintain a healthy lifestyle with balanced diet and light exercise',
    'If symptoms persist beyond 2-3 weeks or worsen, report again',
    'Keep all scheduled appointments',
  ];
}

function collectSuggestedTests(symptoms: SymptomEntry[], urgency: UrgencyLevel): string[] {
  const tests = new Set<string>();

  for (const symptom of symptoms) {
    const concern = CANCER_CONCERN_MAP[symptom.name];
    if (concern) {
      concern.suggestedTests.forEach(t => tests.add(t));
    }
  }

  // Always suggest basic blood work for non-routine
  if (urgency !== 'routine') {
    tests.add('Complete blood count');
  }

  return Array.from(tests);
}
