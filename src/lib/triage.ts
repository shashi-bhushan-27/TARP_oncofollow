// =============================================
// OncoFollow — Operational Routing Engine
// Rule-based routing of patient check-ins into care-team queues.
// It does not diagnose, interpret reports, or recommend tests or treatment;
// every routing decision is reviewed and can be overridden by the care team.
// =============================================

import {
  SymptomEntry, TriageResult, Citation, RoutingPriority,
  Patient, UploadedDocument
} from '@/types';
import {
  scanForRedFlags, scanSymptomsForRedFlags, resolveRoutingPriority,
  SAFETY_DISCLAIMER, EMERGENCY_DISCLAIMER
} from './safety';

interface TriageInput {
  symptoms: SymptomEntry[];
  freeText: string;
  associatedSymptoms: string;
  patient: Patient;
  recentDocuments: UploadedDocument[];
}

/**
 * Pick a queue from the patient's own answers (severity, duration, frequency, trend)
 */
function routeBySelfReport(symptoms: SymptomEntry[]): RoutingPriority {
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

  // Several reported symptoms move the check-in up a queue
  if (symptoms.length >= 3) maxScore += 2;
  else if (symptoms.length >= 2) maxScore += 1;

  if (maxScore >= 8) return 'urgent';
  if (maxScore >= 5) return 'soon';
  return 'routine';
}

/**
 * Describe where the check-in was routed and what was attached for the care team
 */
function generateExplanation(
  symptoms: SymptomEntry[],
  priority: RoutingPriority,
  recentDocs: UploadedDocument[]
): string {
  const symptomNames = symptoms.map(s => s.label).join(', ') || 'your voice/text check-in';
  const attachment = recentDocs.length > 0
    ? 'Your recent oncology reports and symptom logs have been compiled and attached to this high-priority alert for your care team to review.'
    : 'Your symptom log has been compiled and attached to this alert for your care team to review.';

  if (priority === 'emergency') {
    return `Your check-in (${symptomNames}) mentions something on our emergency keyword list, so the on-call oncology coordinator is being paged. ${attachment} Please do not wait for a call back — contact emergency services or go to the nearest emergency department now.`;
  }

  if (priority === 'urgent') {
    return `Your check-in (${symptomNames}) has been routed to the on-call oncology coordinator by SMS for a same-day call back. ${attachment}`;
  }

  if (priority === 'soon') {
    return `Your check-in (${symptomNames}) has been sent to the scheduling desk, which is booking you an oncology follow-up slot this week. You will get an SMS with the date and time.`;
  }

  return `Your check-in (${symptomNames}) has been added to your care team's standard weekly review queue. Your next scheduled follow-up stays as planned, and you can send a new check-in at any time if anything changes.`;
}

/**
 * List the patient records attached to the care-team alert
 */
function buildAttachments(recentDocs: UploadedDocument[]): Citation[] {
  return recentDocs.slice(0, 3).map((doc, i) => ({
    id: `cite-r${i + 1}`,
    label: `[R${i + 1}]`,
    sourceType: 'record',
    sourceId: doc.id,
    sourceTitle: `${doc.reportType === 'xray' ? 'X-ray' : doc.reportType === 'blood_report' ? 'Blood Report' : doc.reportType} — ${doc.reportDate}`,
    snippet: `From ${doc.hospital}. Attached for care-team review.`,
    date: doc.reportDate,
  }));
}

/**
 * Main routing function
 */
export function runTriage(input: TriageInput): TriageResult {
  const { symptoms, freeText, associatedSymptoms, patient, recentDocuments } = input;
  const allText = `${freeText} ${associatedSymptoms}`;

  // Step 1: Emergency keyword scan (safety net)
  const textFlags = scanForRedFlags(allText);
  const symptomFlags = scanSymptomsForRedFlags(symptoms);

  // Step 2: Queue from the patient's own answers
  const baseRouting = routeBySelfReport(symptoms);

  // Step 3: Resolve final routing priority (emergency keywords override everything)
  const priority = resolveRoutingPriority(textFlags, symptomFlags, baseRouting);

  // Step 4: Collect escalation triggers for the audit trail
  const redFlagTriggers = [...textFlags.triggers, ...symptomFlags.triggers];

  // Step 5: Routing summary
  const explanation = generateExplanation(symptoms, priority, recentDocuments);

  // Step 6: What happens next
  const recommendedActions = generateNextSteps(priority);

  // Step 7: Visit preparation steps
  const prepSteps = collectPrepSteps(priority, patient);

  // Step 8: Records attached to the alert
  const citations = buildAttachments(recentDocuments);

  // Step 9: Determine confidence
  const confidenceBand = redFlagTriggers.length > 0 ? 'high' as const : 'moderate' as const;

  return {
    routingPriority: priority,
    explanation,
    recommendedActions,
    prepSteps,
    redFlagTriggers,
    confidenceBand,
    citations,
    disclaimer: priority === 'emergency' ? EMERGENCY_DISCLAIMER : SAFETY_DISCLAIMER,
  };
}

function generateNextSteps(priority: RoutingPriority): string[] {
  if (priority === 'emergency') {
    return [
      'Call emergency services or go to the nearest emergency department now',
      'The on-call oncology coordinator has been paged with your check-in',
      'Tell the emergency team you are under oncology follow-up',
    ];
  }

  if (priority === 'urgent') {
    return [
      'An SMS alert has gone to the on-call oncology coordinator',
      'Keep your phone nearby — the care team will call you back today',
      'If you feel much worse before they reach you, go to the nearest emergency department',
    ];
  }

  if (priority === 'soon') {
    return [
      'The scheduling desk is booking an oncology follow-up slot for you this week',
      'You will receive an SMS with the date and time — reply to it to reschedule',
      'Send a new check-in if anything changes before your visit',
    ];
  }

  return [
    'Your check-in is in the care team\'s standard weekly review queue',
    'Your next scheduled follow-up stays as planned',
    'Send a new check-in at any time if anything changes',
  ];
}

function collectPrepSteps(priority: RoutingPriority, patient: Patient): string[] {
  if (priority === 'emergency') {
    return [
      'Do not drive yourself — ask your caregiver to take you or call an ambulance',
      'Take your treatment summary and medicine list if they are within reach',
      `Share your emergency contact (${patient.emergencyContact.name}) with the hospital staff`,
    ];
  }

  if (priority === 'routine') {
    return [
      'No extra preparation needed right now',
      'Keep logging check-ins so your care team sees the full picture at your next visit',
    ];
  }

  const steps = [
    priority === 'urgent'
      ? 'A nurse has been notified to schedule your follow-up — keep your phone nearby'
      : 'Watch for an SMS confirming your appointment slot',
    'Please ensure your caregiver is available to drive or accompany you',
    'Bring your previous scan CDs and printed reports',
    'Bring your current medicine list and hospital ID card',
  ];

  if (patient.distanceFromCenter > 50) {
    steps.push(`You live about ${patient.distanceFromCenter} km from ${patient.treatmentCenter} — ask the coordinator about travel support or a teleconsult`);
  }

  return steps;
}
