// =============================================
// OncoFollow — Type Definitions
// =============================================

export type UserRole = 'patient' | 'clinician' | 'admin' | 'caregiver';

// Operational routing priority: decides which care-team queue a patient report
// lands in. It is a workflow routing decision, not a clinical risk score, and a
// care-team member can always override it.
export type RoutingPriority = 'routine' | 'soon' | 'urgent' | 'emergency';

export const ROUTING_PRIORITY_ACTIONS: Record<RoutingPriority, string> = {
  routine: 'Added to standard weekly review queue',
  soon: 'Auto-scheduling an oncology follow-up slot this week',
  urgent: 'Triggering SMS alert to on-call oncology coordinator',
  emergency: 'Paging on-call coordinator — please call emergency services now',
};

// Compact queue names for care-team lists, dashboards and filters
export const ROUTING_PRIORITY_SHORT_LABELS: Record<RoutingPriority, string> = {
  routine: 'Weekly review',
  soon: 'Slot this week',
  urgent: 'Coordinator SMS',
  emergency: 'Emergency escalation',
};

// What the same routing means for the patient or caregiver, in plain words
export const PATIENT_ROUTING_STATUS: Record<RoutingPriority, string> = {
  routine: 'Care team will review this week',
  soon: 'Visit being booked this week',
  urgent: 'Care team will call you today',
  emergency: 'Get emergency help now',
};

export type SymptomName =
  | 'cough' | 'breathlessness' | 'chest_pain' | 'fatigue'
  | 'headache' | 'bone_pain' | 'nausea' | 'fever'
  | 'swelling' | 'appetite_loss' | 'weight_loss' | 'dizziness'
  | 'weakness' | 'vision_changes' | 'confusion' | 'seizures'
  | 'hemoptysis' | 'skin_changes' | 'lymph_swelling' | 'numbness';

export type Severity = 'mild' | 'moderate' | 'severe';
export type Frequency = 'occasional' | 'frequent' | 'constant';
export type Trend = 'improving' | 'stable' | 'worsening';

export type CancerStage = 'I' | 'IA' | 'IB' | 'II' | 'IIA' | 'IIB' | 'III' | 'IIIA' | 'IIIB' | 'IIIC' | 'IV';
export type ReceptorStatus = 'ER+' | 'ER-' | 'PR+' | 'PR-' | 'HER2+' | 'HER2-' | 'Triple Negative';
export type TreatmentType = 'surgery' | 'chemotherapy' | 'radiation' | 'hormone_therapy' | 'targeted_therapy' | 'immunotherapy';

export type ReportType = 'xray' | 'ct_scan' | 'mri' | 'blood_report' | 'pathology' | 'discharge_summary' | 'prescription' | 'pet_scan' | 'mammogram' | 'ultrasound' | 'other';
export type BodyRegion = 'chest' | 'breast' | 'brain' | 'bone' | 'liver' | 'abdomen' | 'whole_body' | 'blood' | 'other';

export type AlertType = 'symptom_alert' | 'report_alert' | 'follow_up_due' | 'ai_escalation' | 'clinician_action';
export type AlertStatus = 'new' | 'seen' | 'reviewed' | 'resolved';

export type ClinicianAction = 'reviewed' | 'contact_patient' | 'request_imaging' | 'request_labs' | 'urgent_visit' | 'emergency_referral';

export type AnswerMode = 'patient' | 'clinician';

// =============================================
// Core Models
// =============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  user: User;
  age: number;
  sex: 'female' | 'male' | 'other';
  city: string;
  diagnosisDate: string;
  cancerStage: CancerStage;
  receptorStatus: string[];
  treatmentCenter: string;
  primaryDoctor: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferredLanguage: string;
  distanceFromCenter: number; // km
  followUpFrequency: string;
  treatmentHistory: TreatmentRecord[];
  medications: Medication[];
  followUpSchedule: FollowUp[];
  consentGiven: boolean;
  caregiverUserIds?: string[]; // family caregivers who can act on the patient's behalf
}

export interface TreatmentRecord {
  id: string;
  type: TreatmentType;
  name: string;
  startDate: string;
  endDate?: string;
  details: string;
  hospital: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface FollowUp {
  id: string;
  dueDate: string;
  type: string;
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  notes?: string;
}

// =============================================
// Symptom Reporting
// =============================================

export interface SymptomEntry {
  name: SymptomName;
  label: string;
  severity: Severity;
  duration: string;
  frequency: Frequency;
  trend: Trend;
}

export interface SymptomReport {
  id: string;
  patientId: string;
  symptoms: SymptomEntry[];
  freeText: string;
  associatedSymptoms: string;
  audioUrl?: string;
  transcriptText?: string;
  createdAt: string;
  triageResult?: TriageResult;
}

// =============================================
// Document Upload
// =============================================

export interface UploadedDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  reportType: ReportType;
  reportDate: string;
  hospital: string;
  bodyRegion: BodyRegion;
  keyFindings: string;
  impression: string;
  labValues?: Record<string, string>;
  rawText: string;
  uploadedAt: string;
}

export interface ReportChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
}

// =============================================
// Check-in Routing
// =============================================

export interface TriageResult {
  routingPriority: RoutingPriority;
  explanation: string;
  recommendedActions: string[];
  prepSteps: string[]; // administrative preparation steps for the visit
  redFlagTriggers: string[];
  confidenceBand: 'low' | 'moderate' | 'high';
  citations: Citation[];
  disclaimer: string;
}

export interface Citation {
  id: string;
  label: string; // e.g. [R1]
  sourceType: 'record';
  sourceId: string;
  sourceTitle: string;
  snippet: string;
  date?: string;
}

// =============================================
// Alerts & Clinician
// =============================================

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: AlertType;
  severity: RoutingPriority;
  message: string;
  details: string;
  isRead: boolean;
  status: AlertStatus;
  clinicianId?: string;
  createdAt: string;
  relatedReportId?: string;
}

export interface ClinicianNote {
  id: string;
  clinicianId: string;
  clinicianName: string;
  patientId: string;
  alertId?: string;
  content: string;
  action: ClinicianAction;
  createdAt: string;
}

// =============================================
// Timeline
// =============================================

export type TimelineEventType = 'treatment' | 'visit' | 'symptom' | 'upload' | 'ai_alert' | 'clinician_note' | 'follow_up' | 'medication';

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  urgencyLevel?: RoutingPriority;
  relatedId?: string;
  metadata?: Record<string, string>;
  careTeamOnly?: boolean; // internal workflow events, hidden from patients and caregivers
}

// =============================================
// Patient Notifications (patient/caregiver-facing)
// Kept separate from care-team Alerts, which are an internal work queue.
// =============================================

export type PatientNotificationKind = 'check_in' | 'appointment' | 'report' | 'reminder';

export interface PatientNotification {
  id: string;
  patientId: string;
  kind: PatientNotificationKind;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  actionHref?: string;
  actionLabel?: string;
}

// =============================================
// Admin
// =============================================

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface SystemConfig {
  key: string;
  value: string;
  category: string;
}

// =============================================
// Chat / Assistant
// =============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// =============================================
// Common symptom definitions for the picker
// =============================================

export interface SymptomDefinition {
  name: SymptomName;
  label: string;
  description: string;
  isRedFlag?: boolean;
}

export const SYMPTOM_DEFINITIONS: SymptomDefinition[] = [
  { name: 'cough', label: 'Cough', description: 'Persistent or new cough' },
  { name: 'breathlessness', label: 'Breathlessness', description: 'Difficulty breathing or shortness of breath' },
  { name: 'chest_pain', label: 'Chest Pain', description: 'Pain or discomfort in chest area' },
  { name: 'fatigue', label: 'Fatigue', description: 'Unusual tiredness or exhaustion' },
  { name: 'headache', label: 'Headache', description: 'Persistent or severe headache' },
  { name: 'bone_pain', label: 'Bone Pain', description: 'Pain in bones, joints, or back' },
  { name: 'nausea', label: 'Nausea', description: 'Feeling sick or vomiting' },
  { name: 'fever', label: 'Fever', description: 'Elevated temperature or chills' },
  { name: 'swelling', label: 'Swelling', description: 'New swelling or lump' },
  { name: 'appetite_loss', label: 'Appetite Loss', description: 'Reduced appetite or eating' },
  { name: 'weight_loss', label: 'Weight Loss', description: 'Unexplained weight loss' },
  { name: 'dizziness', label: 'Dizziness', description: 'Lightheadedness or vertigo' },
  { name: 'weakness', label: 'Weakness', description: 'Unusual muscle weakness' },
  { name: 'vision_changes', label: 'Vision Changes', description: 'Blurred or changed vision' },
  { name: 'confusion', label: 'Confusion', description: 'Mental confusion or disorientation', isRedFlag: true },
  { name: 'seizures', label: 'Seizures', description: 'New onset seizures', isRedFlag: true },
  { name: 'hemoptysis', label: 'Coughing Blood', description: 'Blood in cough or sputum', isRedFlag: true },
  { name: 'skin_changes', label: 'Skin Changes', description: 'Rash, redness, or skin irregularities' },
  { name: 'lymph_swelling', label: 'Lymph Node Swelling', description: 'Swollen lymph nodes' },
  { name: 'numbness', label: 'Numbness/Tingling', description: 'Numbness or tingling in extremities' },
];
