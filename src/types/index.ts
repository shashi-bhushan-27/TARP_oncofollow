// =============================================
// OncoFollow — Type Definitions
// =============================================

export type UserRole = 'patient' | 'clinician' | 'admin' | 'caregiver';

export type UrgencyLevel = 'routine' | 'soon' | 'urgent' | 'emergency';

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
// Triage & AI Assessment
// =============================================

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  explanation: string;
  recommendedActions: string[];
  suggestedTests: string[];
  redFlagTriggers: string[];
  confidenceBand: 'low' | 'moderate' | 'high';
  citations: Citation[];
  disclaimer: string;
}

export interface Citation {
  id: string;
  label: string; // e.g. [R1], [G1]
  sourceType: 'record' | 'guideline';
  sourceId: string;
  sourceTitle: string;
  snippet: string;
  date?: string;
}

export interface AIAssessment {
  id: string;
  patientId: string;
  symptomReportId?: string;
  query: string;
  response: string;
  urgencyLevel: UrgencyLevel;
  explanation: string;
  recommendedActions: string[];
  suggestedTests: string[];
  citations: Citation[];
  redFlagTriggers: string[];
  confidenceBand: 'low' | 'moderate' | 'high';
  mode: AnswerMode;
  createdAt: string;
  retrievedDocuments: RetrievedDocument[];
  reasoningSummary: string;
}

export interface RetrievedDocument {
  id: string;
  title: string;
  type: 'record' | 'guideline';
  date?: string;
  relevanceScore: number;
  snippet: string;
}

// =============================================
// Alerts & Clinician
// =============================================

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: AlertType;
  severity: UrgencyLevel;
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
  urgencyLevel?: UrgencyLevel;
  relatedId?: string;
  metadata?: Record<string, string>;
}

// =============================================
// Guidelines
// =============================================

export interface GuidelineDocument {
  id: string;
  title: string;
  source: string;
  category: string;
  content: string;
  version: string;
}

export interface GuidelineChunk {
  id: string;
  guidelineId: string;
  content: string;
  chunkIndex: number;
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
  citations?: Citation[];
  triageResult?: TriageResult;
  retrievedDocuments?: RetrievedDocument[];
}

// =============================================
// Common symptom definitions for the picker
// =============================================

export interface SymptomDefinition {
  name: SymptomName;
  label: string;
  icon: string;
  description: string;
  isRedFlag?: boolean;
}

export const SYMPTOM_DEFINITIONS: SymptomDefinition[] = [
  { name: 'cough', label: 'Cough', icon: '🫁', description: 'Persistent or new cough' },
  { name: 'breathlessness', label: 'Breathlessness', icon: '😮‍💨', description: 'Difficulty breathing or shortness of breath' },
  { name: 'chest_pain', label: 'Chest Pain', icon: '💔', description: 'Pain or discomfort in chest area' },
  { name: 'fatigue', label: 'Fatigue', icon: '😴', description: 'Unusual tiredness or exhaustion' },
  { name: 'headache', label: 'Headache', icon: '🤕', description: 'Persistent or severe headache' },
  { name: 'bone_pain', label: 'Bone Pain', icon: '🦴', description: 'Pain in bones, joints, or back' },
  { name: 'nausea', label: 'Nausea', icon: '🤢', description: 'Feeling sick or vomiting' },
  { name: 'fever', label: 'Fever', icon: '🌡️', description: 'Elevated temperature or chills' },
  { name: 'swelling', label: 'Swelling', icon: '🔴', description: 'New swelling or lump' },
  { name: 'appetite_loss', label: 'Appetite Loss', icon: '🍽️', description: 'Reduced appetite or eating' },
  { name: 'weight_loss', label: 'Weight Loss', icon: '⚖️', description: 'Unexplained weight loss' },
  { name: 'dizziness', label: 'Dizziness', icon: '💫', description: 'Lightheadedness or vertigo' },
  { name: 'weakness', label: 'Weakness', icon: '🦾', description: 'Unusual muscle weakness' },
  { name: 'vision_changes', label: 'Vision Changes', icon: '👁️', description: 'Blurred or changed vision' },
  { name: 'confusion', label: 'Confusion', icon: '🧠', description: 'Mental confusion or disorientation', isRedFlag: true },
  { name: 'seizures', label: 'Seizures', icon: '⚡', description: 'New onset seizures', isRedFlag: true },
  { name: 'hemoptysis', label: 'Coughing Blood', icon: '🩸', description: 'Blood in cough or sputum', isRedFlag: true },
  { name: 'skin_changes', label: 'Skin Changes', icon: '🩹', description: 'Rash, redness, or skin irregularities' },
  { name: 'lymph_swelling', label: 'Lymph Node Swelling', icon: '⭕', description: 'Swollen lymph nodes' },
  { name: 'numbness', label: 'Numbness/Tingling', icon: '✋', description: 'Numbness or tingling in extremities' },
];
