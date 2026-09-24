// =============================================
// OncoFollow — Rich Demo Data
// =============================================
import {
  User, Patient, SymptomReport, UploadedDocument, Alert, ClinicianNote,
  TimelineEvent, AuditLog, RoutingPriority, PatientNotification
} from '@/types';

// =============================================
// Users
// =============================================
export const demoUsers: User[] = [
  { id: 'u1', name: 'Priya Sharma', email: 'priya.sharma@email.com', role: 'patient', createdAt: '2025-06-15' },
  { id: 'u2', name: 'Anita Patel', email: 'anita.patel@email.com', role: 'patient', createdAt: '2025-07-20' },
  { id: 'u3', name: 'Meera Reddy', email: 'meera.reddy@email.com', role: 'patient', createdAt: '2025-08-10' },
  { id: 'u4', name: 'Fatima Khan', email: 'fatima.khan@email.com', role: 'patient', createdAt: '2025-05-01' },
  { id: 'u5', name: 'Kavita Joshi', email: 'kavita.joshi@email.com', role: 'patient', createdAt: '2025-09-01' },
  { id: 'u6', name: 'Dr. Rajesh Kumar', email: 'dr.kumar@hospital.com', role: 'clinician', createdAt: '2025-01-01' },
  { id: 'u7', name: 'Dr. Sunita Mehta', email: 'dr.mehta@hospital.com', role: 'clinician', createdAt: '2025-01-01' },
  { id: 'u8', name: 'Admin User', email: 'admin@oncofollow.com', role: 'admin', createdAt: '2025-01-01' },
  { id: 'u9', name: 'Ramesh Joshi', email: 'ramesh.joshi@email.com', role: 'caregiver', createdAt: '2025-09-05' },
];

// =============================================
// Patients — Full Profiles
// =============================================
export const demoPatients: Patient[] = [
  {
    id: 'p1',
    userId: 'u1',
    user: demoUsers[0],
    age: 52,
    sex: 'female',
    city: 'Delhi',
    diagnosisDate: '2024-08-15',
    cancerStage: 'IIA',
    receptorStatus: ['ER+', 'PR+', 'HER2-'],
    treatmentCenter: 'AIIMS Delhi',
    primaryDoctor: 'Dr. Rajesh Kumar',
    emergencyContact: { name: 'Vikram Sharma', phone: '+91 98765 43210', relationship: 'Husband' },
    preferredLanguage: 'English',
    distanceFromCenter: 25,
    followUpFrequency: 'Every 3 months',
    consentGiven: true,
    treatmentHistory: [
      { id: 'th1', type: 'surgery', name: 'Modified Radical Mastectomy (Left)', startDate: '2024-09-10', endDate: '2024-09-10', details: 'Complete resection with clear margins. 12 lymph nodes removed, 2 positive.', hospital: 'AIIMS Delhi' },
      { id: 'th2', type: 'chemotherapy', name: 'AC-T Regimen', startDate: '2024-10-15', endDate: '2025-02-28', details: '4 cycles AC followed by 4 cycles Taxol. Tolerated well with mild neuropathy.', hospital: 'AIIMS Delhi' },
      { id: 'th3', type: 'radiation', name: 'Chest Wall Radiation', startDate: '2025-03-15', endDate: '2025-04-25', details: '25 fractions to left chest wall and supraclavicular area. Completed without interruption.', hospital: 'AIIMS Delhi' },
      { id: 'th4', type: 'hormone_therapy', name: 'Tamoxifen 20mg', startDate: '2025-05-01', details: 'Adjuvant endocrine therapy planned for 5 years.', hospital: 'AIIMS Delhi' },
    ],
    medications: [
      { id: 'm1', name: 'Tamoxifen', dosage: '20mg', frequency: 'Once daily', startDate: '2025-05-01', isActive: true },
      { id: 'm2', name: 'Calcium + Vitamin D', dosage: '500mg/250IU', frequency: 'Once daily', startDate: '2025-05-01', isActive: true },
      { id: 'm3', name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', startDate: '2025-03-01', isActive: true },
    ],
    followUpSchedule: [
      { id: 'f1', dueDate: '2025-08-15', type: 'Clinical exam + blood work', status: 'completed', notes: 'Attended' },
      { id: 'f2', dueDate: '2025-11-15', type: 'Clinical exam + mammogram', status: 'completed', notes: 'Attended' },
      { id: 'f3', dueDate: '2026-02-15', type: 'Clinical exam + blood work', status: 'completed', notes: 'Attended' },
      { id: 'f4', dueDate: '2026-04-15', type: 'Clinical exam + chest imaging', status: 'scheduled' },
    ],
  },
  {
    id: 'p2',
    userId: 'u2',
    user: demoUsers[1],
    age: 45,
    sex: 'female',
    city: 'Mumbai',
    diagnosisDate: '2025-01-10',
    cancerStage: 'IA',
    receptorStatus: ['Triple Negative'],
    treatmentCenter: 'Tata Memorial Hospital',
    primaryDoctor: 'Dr. Sunita Mehta',
    emergencyContact: { name: 'Rahul Patel', phone: '+91 98123 45678', relationship: 'Brother' },
    preferredLanguage: 'Hindi',
    distanceFromCenter: 10,
    followUpFrequency: 'Every 3 months',
    consentGiven: true,
    treatmentHistory: [
      { id: 'th5', type: 'surgery', name: 'Lumpectomy with Sentinel Node Biopsy', startDate: '2025-02-05', endDate: '2025-02-05', details: 'Clear margins. 3 sentinel nodes negative.', hospital: 'Tata Memorial Hospital' },
      { id: 'th6', type: 'chemotherapy', name: 'Dose-Dense AC-T', startDate: '2025-03-01', endDate: '2025-06-30', details: 'Completed without dose reductions.', hospital: 'Tata Memorial Hospital' },
      { id: 'th7', type: 'radiation', name: 'Whole Breast Radiation', startDate: '2025-07-15', endDate: '2025-08-20', details: '16 fractions hypofractionated. Well-tolerated.', hospital: 'Tata Memorial Hospital' },
    ],
    medications: [
      { id: 'm4', name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', startDate: '2025-07-01', isActive: true },
    ],
    followUpSchedule: [
      { id: 'f5', dueDate: '2025-11-20', type: 'Clinical exam', status: 'completed', notes: 'Attended' },
      { id: 'f6', dueDate: '2026-02-20', type: 'Clinical exam + mammogram', status: 'completed', notes: 'Attended' },
      { id: 'f7', dueDate: '2026-05-20', type: 'Clinical exam + blood work', status: 'scheduled' },
    ],
  },
  {
    id: 'p3',
    userId: 'u3',
    user: demoUsers[2],
    age: 60,
    sex: 'female',
    city: 'Hyderabad',
    diagnosisDate: '2024-06-20',
    cancerStage: 'IIIA',
    receptorStatus: ['ER-', 'PR-', 'HER2+'],
    treatmentCenter: 'Nizam\'s Institute of Medical Sciences',
    primaryDoctor: 'Dr. Rajesh Kumar',
    emergencyContact: { name: 'Lakshmi Reddy', phone: '+91 87654 32100', relationship: 'Daughter' },
    preferredLanguage: 'English',
    distanceFromCenter: 45,
    followUpFrequency: 'Every 3 months',
    consentGiven: true,
    treatmentHistory: [
      { id: 'th8', type: 'chemotherapy', name: 'TCHP Regimen', startDate: '2024-07-15', endDate: '2024-12-30', details: '6 cycles neoadjuvant. Good partial response.', hospital: 'NIMS Hyderabad' },
      { id: 'th9', type: 'surgery', name: 'Modified Radical Mastectomy (Right)', startDate: '2025-01-20', endDate: '2025-01-20', details: 'Pathological partial response. 3/14 nodes positive.', hospital: 'NIMS Hyderabad' },
      { id: 'th10', type: 'radiation', name: 'Post-Mastectomy Radiation', startDate: '2025-03-01', endDate: '2025-04-10', details: '25 fractions. Mild skin reaction resolved.', hospital: 'NIMS Hyderabad' },
      { id: 'th11', type: 'targeted_therapy', name: 'Trastuzumab (Herceptin)', startDate: '2024-07-15', details: '18 cycles total including neoadjuvant. Ongoing maintenance.', hospital: 'NIMS Hyderabad' },
    ],
    medications: [
      { id: 'm5', name: 'Trastuzumab', dosage: '6mg/kg', frequency: 'Every 3 weeks', startDate: '2024-07-15', isActive: true },
      { id: 'm6', name: 'Calcium', dosage: '1000mg', frequency: 'Once daily', startDate: '2025-01-20', isActive: true },
      { id: 'm7', name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', startDate: '2026-03-01', isActive: true },
    ],
    followUpSchedule: [
      { id: 'f8', dueDate: '2026-04-10', type: 'Clinical exam + echocardiogram', status: 'scheduled' },
    ],
  },
  {
    id: 'p4',
    userId: 'u4',
    user: demoUsers[3],
    age: 38,
    sex: 'female',
    city: 'Lucknow',
    diagnosisDate: '2024-12-01',
    cancerStage: 'IIB',
    receptorStatus: ['ER+', 'PR-', 'HER2-'],
    treatmentCenter: 'King George Medical University',
    primaryDoctor: 'Dr. Sunita Mehta',
    emergencyContact: { name: 'Ahmed Khan', phone: '+91 76543 21098', relationship: 'Husband' },
    preferredLanguage: 'Hindi',
    distanceFromCenter: 120,
    followUpFrequency: 'Every 3 months',
    consentGiven: true,
    treatmentHistory: [
      { id: 'th12', type: 'surgery', name: 'Breast Conservation Surgery', startDate: '2025-01-15', endDate: '2025-01-15', details: 'Clear margins. 2/8 nodes positive.', hospital: 'KGMU Lucknow' },
      { id: 'th13', type: 'chemotherapy', name: 'TC Regimen', startDate: '2025-02-15', endDate: '2025-05-30', details: '4 cycles. Moderate nausea managed with antiemetics.', hospital: 'KGMU Lucknow' },
      { id: 'th14', type: 'radiation', name: 'Whole Breast + Boost', startDate: '2025-06-15', endDate: '2025-07-28', details: '28 fractions. Completed.', hospital: 'KGMU Lucknow' },
      { id: 'th15', type: 'hormone_therapy', name: 'Letrozole 2.5mg', startDate: '2025-08-01', details: 'Adjuvant AI therapy with GnRH agonist.', hospital: 'KGMU Lucknow' },
    ],
    medications: [
      { id: 'm8', name: 'Letrozole', dosage: '2.5mg', frequency: 'Once daily', startDate: '2025-08-01', isActive: true },
      { id: 'm9', name: 'Goserelin', dosage: '3.6mg', frequency: 'Every 28 days', startDate: '2025-08-01', isActive: true },
    ],
    followUpSchedule: [
      { id: 'f9', dueDate: '2026-04-01', type: 'Clinical exam', status: 'overdue' },
    ],
  },
  {
    id: 'p5',
    userId: 'u5',
    user: demoUsers[4],
    age: 55,
    sex: 'female',
    city: 'Pune',
    diagnosisDate: '2025-03-10',
    cancerStage: 'IIA',
    receptorStatus: ['ER+', 'PR+', 'HER2-'],
    treatmentCenter: 'Ruby Hall Clinic',
    primaryDoctor: 'Dr. Rajesh Kumar',
    emergencyContact: { name: 'Ramesh Joshi', phone: '+91 95432 10987', relationship: 'Son' },
    preferredLanguage: 'Marathi',
    distanceFromCenter: 5,
    followUpFrequency: 'Every 6 months',
    consentGiven: true,
    caregiverUserIds: ['u9'],
    treatmentHistory: [
      { id: 'th16', type: 'surgery', name: 'Mastectomy with Reconstruction', startDate: '2025-04-15', endDate: '2025-04-15', details: 'Implant-based reconstruction. Clear margins. All nodes negative.', hospital: 'Ruby Hall Clinic' },
      { id: 'th17', type: 'chemotherapy', name: 'TC Regimen', startDate: '2025-05-20', endDate: '2025-08-15', details: '4 cycles. Mild side effects.', hospital: 'Ruby Hall Clinic' },
      { id: 'th18', type: 'hormone_therapy', name: 'Anastrozole 1mg', startDate: '2025-09-01', details: 'Adjuvant therapy.', hospital: 'Ruby Hall Clinic' },
    ],
    medications: [
      { id: 'm10', name: 'Anastrozole', dosage: '1mg', frequency: 'Once daily', startDate: '2025-09-01', isActive: true },
    ],
    followUpSchedule: [
      { id: 'f10', dueDate: '2026-03-01', type: 'Clinical exam + mammogram', status: 'completed', notes: 'Attended' },
      { id: 'f11', dueDate: '2026-09-01', type: 'Clinical exam + blood work', status: 'scheduled' },
    ],
  },
];

// =============================================
// Symptom Reports
// =============================================
export const demoSymptomReports: SymptomReport[] = [
  {
    id: 'sr1',
    patientId: 'p1',
    symptoms: [
      { name: 'cough', label: 'Cough', severity: 'moderate', duration: '3 weeks', frequency: 'frequent', trend: 'worsening' },
      { name: 'chest_pain', label: 'Chest Pain', severity: 'mild', duration: '1 week', frequency: 'occasional', trend: 'stable' },
      { name: 'fatigue', label: 'Fatigue', severity: 'moderate', duration: '2 weeks', frequency: 'frequent', trend: 'worsening' },
    ],
    freeText: 'I have had a dry cough for about 3 weeks now. It started mild but has been getting worse. I also feel a dull ache in my chest sometimes, especially when coughing. I feel more tired than usual. I am worried because of my cancer history.',
    associatedSymptoms: 'Mild breathlessness on exertion, occasional night sweats',
    createdAt: '2026-03-28T10:30:00Z',
    triageResult: {
      routingPriority: 'urgent',
      explanation: 'Your check-in (Cough, Chest Pain, Fatigue) has been routed to the on-call oncology coordinator by SMS for a same-day call back. Your recent oncology reports and symptom logs have been compiled and attached to this high-priority alert for your care team to review.',
      recommendedActions: [
        'An SMS alert has gone to the on-call oncology coordinator',
        'Keep your phone nearby — the care team will call you back today',
        'If you feel much worse before they reach you, go to the nearest emergency department',
      ],
      prepSteps: [
        'A nurse has been notified to schedule your follow-up — keep your phone nearby',
        'Please ensure your caregiver is available to drive or accompany you',
        'Bring your previous scan CDs and printed reports',
        'Bring your current medicine list and hospital ID card',
      ],
      redFlagTriggers: [],
      confidenceBand: 'high',
      citations: [
        { id: 'c1', label: '[R1]', sourceType: 'record', sourceId: 'doc1', sourceTitle: 'Chest X-ray PA View — Mar 2026', snippet: 'Attached for care-team review.', date: '2026-03-25' },
        { id: 'c2', label: '[R2]', sourceType: 'record', sourceId: 'th2', sourceTitle: 'Treatment Summary — AC-T Chemotherapy', snippet: 'Attached for care-team review.', date: '2025-02-28' },
      ],
      disclaimer: 'This tool is for follow-up support and does not replace a doctor\'s diagnosis. Please consult your healthcare team for any medical concerns.',
    },
  },
  {
    id: 'sr2',
    patientId: 'p2',
    symptoms: [
      { name: 'fatigue', label: 'Fatigue', severity: 'mild', duration: '1 week', frequency: 'occasional', trend: 'stable' },
    ],
    freeText: 'Just feeling a bit tired this week, probably because of work stress. Nothing else concerning.',
    associatedSymptoms: 'None',
    createdAt: '2026-03-30T09:15:00Z',
    triageResult: {
      routingPriority: 'routine',
      explanation: 'Your check-in (Fatigue) has been added to your care team\'s standard weekly review queue. Your next scheduled follow-up stays as planned, and you can send a new check-in at any time if anything changes.',
      recommendedActions: [
        'Your check-in is in the care team\'s standard weekly review queue',
        'Your next scheduled follow-up stays as planned',
        'Send a new check-in at any time if anything changes',
      ],
      prepSteps: [
        'No extra preparation needed right now',
        'Keep logging check-ins so your care team sees the full picture at your next visit',
      ],
      redFlagTriggers: [],
      confidenceBand: 'high',
      citations: [],
      disclaimer: 'This tool is for follow-up support and does not replace a doctor\'s diagnosis.',
    },
  },
  {
    id: 'sr3',
    patientId: 'p3',
    symptoms: [
      { name: 'bone_pain', label: 'Bone Pain', severity: 'moderate', duration: '2 weeks', frequency: 'frequent', trend: 'worsening' },
      { name: 'fatigue', label: 'Fatigue', severity: 'moderate', duration: '3 weeks', frequency: 'frequent', trend: 'worsening' },
    ],
    freeText: 'My lower back has been hurting more and more over the past two weeks. The pain is deep and aching. It wakes me up at night sometimes. I am also more tired than usual.',
    associatedSymptoms: 'Difficulty sleeping due to pain',
    createdAt: '2026-03-29T14:00:00Z',
    triageResult: {
      routingPriority: 'soon',
      explanation: 'Your check-in (Bone Pain, Fatigue) has been sent to the scheduling desk, which is booking you an oncology follow-up slot this week. You will get an SMS with the date and time.',
      recommendedActions: [
        'The scheduling desk is booking an oncology follow-up slot for you this week',
        'You will receive an SMS with the date and time — reply to it to reschedule',
        'Send a new check-in if anything changes before your visit',
      ],
      prepSteps: [
        'Watch for an SMS confirming your appointment slot',
        'Please ensure your caregiver is available to drive or accompany you',
        'Bring your previous scan CDs and printed reports',
        'Bring your current medicine list and hospital ID card',
      ],
      redFlagTriggers: [],
      confidenceBand: 'moderate',
      citations: [
        { id: 'c6', label: '[R1]', sourceType: 'record', sourceId: 'th8', sourceTitle: 'Treatment Summary — TCHP Neoadjuvant', snippet: 'Attached for care-team review.', date: '2024-12-30' },
      ],
      disclaimer: 'This tool is for follow-up support and does not replace a doctor\'s diagnosis.',
    },
  },
  {
    id: 'sr4',
    patientId: 'p4',
    symptoms: [
      { name: 'headache', label: 'Headache', severity: 'severe', duration: '2 days', frequency: 'constant', trend: 'worsening' },
      { name: 'vision_changes', label: 'Vision Changes', severity: 'moderate', duration: '1 day', frequency: 'constant', trend: 'worsening' },
      { name: 'nausea', label: 'Nausea', severity: 'moderate', duration: '1 day', frequency: 'frequent', trend: 'worsening' },
    ],
    freeText: 'I woke up yesterday with the worst headache I have ever had. It is not going away with medicine. Today my vision is blurry on the left side and I feel very nauseous. I am scared.',
    associatedSymptoms: 'Sensitivity to light, mild confusion',
    createdAt: '2026-04-01T08:00:00Z',
    triageResult: {
      routingPriority: 'emergency',
      explanation: 'Your check-in (Headache, Vision Changes, Nausea) mentions something on our emergency keyword list, so the on-call oncology coordinator is being paged. Your recent oncology reports and symptom logs have been compiled and attached to this high-priority alert for your care team to review. Please do not wait for a call back — contact emergency services or go to the nearest emergency department now.',
      recommendedActions: [
        'Call emergency services or go to the nearest emergency department now',
        'The on-call oncology coordinator has been paged with your check-in',
        'Tell the emergency team you are under oncology follow-up',
      ],
      prepSteps: [
        'Do not drive yourself — ask your caregiver to take you or call an ambulance',
        'Take your treatment summary and medicine list if they are within reach',
        'Share your emergency contact with the hospital staff',
      ],
      redFlagTriggers: ['Emergency keyword: worst headache', 'Emergency keyword: confusion', 'Combination: headache + vision changes'],
      confidenceBand: 'high',
      citations: [],
      disclaimer: 'This tool is for follow-up support and does not replace a doctor\'s diagnosis. PLEASE SEEK IMMEDIATE EMERGENCY CARE.',
    },
  },
];

// =============================================
// Uploaded Documents
// =============================================
export const demoDocuments: UploadedDocument[] = [
  {
    id: 'doc1',
    patientId: 'p1',
    fileName: 'chest_xray_mar2026.pdf',
    fileType: 'application/pdf',
    fileUrl: '/uploads/chest_xray_mar2026.pdf',
    reportType: 'xray',
    reportDate: '2026-03-25',
    hospital: 'AIIMS Delhi',
    bodyRegion: 'chest',
    keyFindings: 'Small 1.2cm nodule in right lower lobe. No pleural effusion. Heart size normal. Bony thorax unremarkable.',
    impression: 'Right lower lobe pulmonary nodule. Recommend CT chest with contrast for further characterization. Correlate with clinical history.',
    rawText: 'CHEST X-RAY PA VIEW\nDate: 25-Mar-2026\nHospital: AIIMS Delhi\n\nFINDINGS:\n- Lungs: A small, well-defined rounded opacity measuring approximately 1.2 cm is noted in the right lower zone, likely representing a pulmonary nodule.\n- No consolidation or collapse.\n- No pleural effusion.\n- Mediastinum is central.\n- Heart size within normal limits.\n- Bony thorax and soft tissues unremarkable.\n\nIMPRESSION:\nRight lower lobe pulmonary nodule measuring ~1.2 cm. CT chest with contrast recommended for further evaluation. Clinical correlation advised given history of breast carcinoma.',
    uploadedAt: '2026-03-26T11:00:00Z',
  },
  {
    id: 'doc2',
    patientId: 'p1',
    fileName: 'cbc_report_mar2026.pdf',
    fileType: 'application/pdf',
    fileUrl: '/uploads/cbc_report_mar2026.pdf',
    reportType: 'blood_report',
    reportDate: '2026-03-25',
    hospital: 'AIIMS Delhi',
    bodyRegion: 'blood',
    keyFindings: 'Hemoglobin slightly low at 11.2 g/dL. WBC and platelets within normal range. ESR mildly elevated at 28 mm/hr.',
    impression: 'Mild anemia. Mildly elevated ESR. Suggest clinical correlation.',
    labValues: {
      'Hemoglobin': '11.2 g/dL (ref: 12-16)',
      'WBC': '6,800 /μL (ref: 4,000-11,000)',
      'Platelets': '2,45,000 /μL (ref: 1,50,000-4,00,000)',
      'ESR': '28 mm/hr (ref: 0-20)',
      'RBC': '4.1 M/μL (ref: 3.8-5.2)',
      'MCV': '84 fL (ref: 80-100)',
      'MCH': '27.3 pg (ref: 27-33)',
    },
    rawText: 'COMPLETE BLOOD COUNT REPORT\nDate: 25-Mar-2026\nHospital: AIIMS Delhi\nPatient: Priya Sharma\n\nHemoglobin: 11.2 g/dL (Normal: 12.0-16.0)\nRBC: 4.1 M/μL (Normal: 3.8-5.2)\nWBC: 6,800 /μL (Normal: 4,000-11,000)\nPlatelets: 2,45,000 /μL (Normal: 1,50,000-4,00,000)\nESR: 28 mm/hr (Normal: 0-20)\nMCV: 84 fL (Normal: 80-100)\nMCH: 27.3 pg (Normal: 27-33)\n\nImpression: Mild anemia with mildly elevated ESR. Clinical correlation recommended.',
    uploadedAt: '2026-03-26T11:30:00Z',
  },
  {
    id: 'doc3',
    patientId: 'p1',
    fileName: 'mammogram_nov2025.pdf',
    fileType: 'application/pdf',
    fileUrl: '/uploads/mammogram_nov2025.pdf',
    reportType: 'mammogram',
    reportDate: '2025-11-15',
    hospital: 'AIIMS Delhi',
    bodyRegion: 'breast',
    keyFindings: 'Right breast normal. Left breast status post mastectomy. No suspicious findings on right side.',
    impression: 'BIRADS 1 - Negative. Routine follow-up recommended.',
    rawText: 'MAMMOGRAM REPORT\nDate: 15-Nov-2025\nLeft breast: Status post mastectomy.\nRight breast: No suspicious masses or calcifications. Normal fibroglandular tissue.\nIMPRESSION: BIRADS 1 - Negative.',
    uploadedAt: '2025-11-16T10:00:00Z',
  },
  {
    id: 'doc4',
    patientId: 'p1',
    fileName: 'discharge_summary_sep2024.pdf',
    fileType: 'application/pdf',
    fileUrl: '/uploads/discharge_summary_sep2024.pdf',
    reportType: 'discharge_summary',
    reportDate: '2024-09-12',
    hospital: 'AIIMS Delhi',
    bodyRegion: 'breast',
    keyFindings: 'Status post left modified radical mastectomy for Stage IIA IDC. ER+/PR+/HER2-. 2/12 nodes positive. Margins clear.',
    impression: 'Successful surgery. Recommended for adjuvant chemotherapy followed by radiation and endocrine therapy.',
    rawText: 'DISCHARGE SUMMARY\nDate: 12-Sep-2024\nPatient: Priya Sharma (52F)\nDiagnosis: Left breast invasive ductal carcinoma, Stage IIA (T2N1M0), ER+/PR+/HER2-\nProcedure: Left Modified Radical Mastectomy\nFindings: 2.8cm IDC, Grade 2, 2 of 12 axillary lymph nodes positive. Margins clear.\nPlan: Adjuvant AC-T chemotherapy → Radiation → Tamoxifen × 5 years',
    uploadedAt: '2024-09-15T10:00:00Z',
  },
];

// =============================================
// Alerts
// =============================================
export const demoAlerts: Alert[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Priya Sharma',
    type: 'ai_escalation',
    severity: 'urgent',
    message: 'Coordinator SMS sent: check-in marked "getting worse" by patient',
    details: 'Patient check-in lists cough (3 weeks, patient says worsening), chest discomfort and tiredness. Routed by escalation rules to the on-call coordinator for a same-day call back. Symptom log and the 2 reports uploaded on 26 Mar are attached for clinician review.',
    isRead: false,
    status: 'new',
    createdAt: '2026-03-28T10:35:00Z',
    relatedReportId: 'sr1',
  },
  {
    id: 'a2',
    patientId: 'p4',
    patientName: 'Fatima Khan',
    type: 'ai_escalation',
    severity: 'emergency',
    message: 'Emergency keywords in check-in — on-call coordinator paged',
    details: 'Patient check-in contains emergency-list keywords ("worst headache", "confusion") and the headache + vision changes rule. Patient was shown the call-emergency-services screen. Please confirm contact with the patient or caregiver.',
    isRead: false,
    status: 'new',
    createdAt: '2026-04-01T08:05:00Z',
    relatedReportId: 'sr4',
  },
  {
    id: 'a3',
    patientId: 'p3',
    patientName: 'Meera Reddy',
    type: 'symptom_alert',
    severity: 'soon',
    message: 'Follow-up slot requested this week',
    details: 'Patient check-in lists lower back pain (2 weeks, patient says worsening) and tiredness. Routed to the scheduling desk for an oncology slot this week.',
    isRead: true,
    status: 'seen',
    clinicianId: 'u6',
    createdAt: '2026-03-29T14:10:00Z',
    relatedReportId: 'sr3',
  },
  {
    id: 'a4',
    patientId: 'p4',
    patientName: 'Fatima Khan',
    type: 'follow_up_due',
    severity: 'soon',
    message: 'Follow-up appointment overdue',
    details: 'Clinical exam was due on April 1, 2026. Patient has not completed scheduled follow-up. Last visit was over 3 months ago.',
    isRead: true,
    status: 'seen',
    createdAt: '2026-04-02T00:00:00Z',
  },
  {
    id: 'a5',
    patientId: 'p1',
    patientName: 'Priya Sharma',
    type: 'report_alert',
    severity: 'soon',
    message: 'New report uploaded: chest X-ray (25 Mar 2026)',
    details: 'Priya uploaded a chest X-ray report from AIIMS Delhi. It has been filed to her record and queued for clinician review before her next visit.',
    isRead: false,
    status: 'new',
    createdAt: '2026-03-26T11:05:00Z',
    relatedReportId: 'doc1',
  },
];

// =============================================
// Clinician Notes
// =============================================
export const demoClinicianNotes: ClinicianNote[] = [
  {
    id: 'cn1',
    clinicianId: 'u6',
    clinicianName: 'Dr. Rajesh Kumar',
    patientId: 'p3',
    alertId: 'a3',
    content: 'Reviewed symptom report. Bone pain and fatigue in IIIA HER2+ patient concerning. Ordering bone scan and blood work. Will see patient in clinic this week.',
    action: 'request_imaging',
    createdAt: '2026-03-30T09:00:00Z',
  },
];

// =============================================
// Timeline Events (for Priya Sharma — primary case)
// =============================================
export const demoTimeline: TimelineEvent[] = [
  // Priya Sharma timeline
  { id: 'te1', patientId: 'p1', type: 'treatment', title: 'Diagnosis', description: 'Left breast invasive ductal carcinoma, Stage IIA (T2N1M0), ER+/PR+/HER2-', date: '2024-08-15' },
  { id: 'te2', patientId: 'p1', type: 'treatment', title: 'Surgery — Modified Radical Mastectomy', description: 'Left MRM completed. Clear margins. 2/12 nodes positive.', date: '2024-09-10' },
  { id: 'te3', patientId: 'p1', type: 'treatment', title: 'Chemotherapy Started — AC-T', description: '4 cycles AC followed by 4 cycles Taxol.', date: '2024-10-15' },
  { id: 'te4', patientId: 'p1', type: 'treatment', title: 'Chemotherapy Completed', description: 'All 8 cycles completed. Tolerated well. Mild peripheral neuropathy.', date: '2025-02-28' },
  { id: 'te5', patientId: 'p1', type: 'treatment', title: 'Radiation Therapy', description: '25 fractions to left chest wall and supraclavicular area.', date: '2025-03-15' },
  { id: 'te6', patientId: 'p1', type: 'treatment', title: 'Radiation Completed', description: 'Completed without interruption. Mild skin erythema resolved.', date: '2025-04-25' },
  { id: 'te7', patientId: 'p1', type: 'medication', title: 'Tamoxifen Started', description: 'Adjuvant endocrine therapy — Tamoxifen 20mg daily for 5 years.', date: '2025-05-01' },
  { id: 'te8', patientId: 'p1', type: 'follow_up', title: 'Follow-up Visit — Attended', description: 'Clinical exam and blood work completed. Clinic notes on file.', date: '2025-08-15' },
  { id: 'te9', patientId: 'p1', type: 'follow_up', title: 'Follow-up + Mammogram — Attended', description: 'Clinical exam and mammogram completed. Clinic notes on file.', date: '2025-11-15' },
  { id: 'te10', patientId: 'p1', type: 'upload', title: 'Mammogram Report Uploaded', description: 'Filed to record and shared with care team.', date: '2025-11-16' },
  { id: 'te11', patientId: 'p1', type: 'follow_up', title: 'Follow-up Visit — Attended', description: 'Clinical exam and blood work completed. Clinic notes on file.', date: '2026-02-15' },
  { id: 'te12', patientId: 'p1', type: 'upload', title: 'Chest X-ray Report Uploaded', description: 'Filed to record and queued for clinician review.', date: '2026-03-26' },
  { id: 'te13', patientId: 'p1', type: 'upload', title: 'Blood Report Uploaded', description: 'Filed to record and queued for clinician review.', date: '2026-03-26' },
  { id: 'te14', patientId: 'p1', type: 'symptom', title: 'Symptom Report — Cough, Chest Pain, Fatigue', description: 'Reported: cough for 3 weeks (getting worse), mild chest pain, tiredness. Sent to the care team.', date: '2026-03-28', urgencyLevel: 'urgent' },
  { id: 'te15', patientId: 'p1', type: 'ai_alert', careTeamOnly: true, title: 'Coordinator SMS Alert Sent', description: 'Check-in, symptom log and recent reports sent to the on-call oncology coordinator for a same-day call back.', date: '2026-03-28', urgencyLevel: 'urgent' },
];

// =============================================
// Patient Notifications (what patients and caregivers see)
// =============================================
export const demoPatientNotifications: PatientNotification[] = [
  // Priya Sharma
  { id: 'pn1', patientId: 'p1', kind: 'check_in', title: 'Your care team has your check-in', body: 'Thank you for checking in on 28 Mar. The on-call coordinator has your update and will call you back today. Please keep your phone nearby.', createdAt: '2026-03-28T10:35:00Z', isRead: false },
  { id: 'pn2', patientId: 'p1', kind: 'appointment', title: 'Please rebook your follow-up visit', body: 'Your clinical exam and chest imaging visit on 15 Apr at AIIMS Delhi has passed. Call the clinic to pick a new date.', createdAt: '2026-04-16T09:00:00Z', isRead: false, actionHref: '/assistant', actionLabel: 'Help me prepare' },
  { id: 'pn3', patientId: 'p1', kind: 'report', title: 'Chest X-ray report filed', body: 'Your report from 25 Mar is on your care timeline, and your care team can see it.', createdAt: '2026-03-26T11:05:00Z', isRead: true, actionHref: '/timeline', actionLabel: 'View timeline' },
  { id: 'pn4', patientId: 'p1', kind: 'reminder', title: 'Daily medicine reminder', body: 'Tamoxifen 20mg, once a day, as prescribed by your doctor.', createdAt: '2026-03-01T08:00:00Z', isRead: true },

  // Anita Patel
  { id: 'pn5', patientId: 'p2', kind: 'check_in', title: 'Your check-in was received', body: 'Your care team will look at it in this week\'s review. Your next visit on 20 May stays as planned.', createdAt: '2026-03-30T09:20:00Z', isRead: true },
  { id: 'pn6', patientId: 'p2', kind: 'appointment', title: 'Upcoming visit: 20 May', body: 'Clinical exam and blood work at Tata Memorial Hospital. Bring your medicine list and any new reports.', createdAt: '2026-05-13T09:00:00Z', isRead: false, actionHref: '/assistant', actionLabel: 'Help me prepare' },

  // Meera Reddy
  { id: 'pn7', patientId: 'p3', kind: 'check_in', title: 'A follow-up visit is being booked', body: 'Your care team is booking you a visit this week. You will get an SMS with the date and time.', createdAt: '2026-03-29T14:15:00Z', isRead: false },

  // Fatima Khan
  { id: 'pn8', patientId: 'p4', kind: 'check_in', title: 'Your care team was alerted', body: 'If you have not already, please call emergency services or go to the nearest hospital now. Your care team will also contact you.', createdAt: '2026-04-01T08:05:00Z', isRead: false },
  { id: 'pn9', patientId: 'p4', kind: 'appointment', title: 'Please rebook your follow-up visit', body: 'Your clinical exam was due on 1 Apr. Call the clinic to pick a new date.', createdAt: '2026-04-02T09:00:00Z', isRead: true },

  // Kavita Joshi (caregiver: Ramesh Joshi)
  { id: 'pn10', patientId: 'p5', kind: 'appointment', title: 'Upcoming visit: 1 Sep', body: 'Clinical exam and blood work at Ruby Hall Clinic. Ramesh, please plan to accompany Kavita.', createdAt: '2026-08-25T09:00:00Z', isRead: false, actionHref: '/assistant', actionLabel: 'Help me prepare' },
  { id: 'pn11', patientId: 'p5', kind: 'reminder', title: 'Caregiver access added', body: 'Ramesh Joshi can now send check-ins and upload reports on Kavita\'s behalf.', createdAt: '2025-09-05T10:00:00Z', isRead: true },
];

// =============================================
// Audit Logs
// =============================================
export const demoAuditLogs: AuditLog[] = [
  { id: 'al1', userId: 'u1', userName: 'Priya Sharma', action: 'symptom_report_created', resource: 'symptom_reports/sr1', details: 'Patient submitted symptom report with cough, chest pain, fatigue', timestamp: '2026-03-28T10:30:00Z' },
  { id: 'al2', userId: 'u1', userName: 'Priya Sharma', action: 'document_uploaded', resource: 'documents/doc1', details: 'Uploaded chest X-ray report', timestamp: '2026-03-26T11:00:00Z' },
  { id: 'al3', userId: 'u1', userName: 'Priya Sharma', action: 'document_uploaded', resource: 'documents/doc2', details: 'Uploaded CBC report', timestamp: '2026-03-26T11:30:00Z' },
  { id: 'al4', userId: 'u6', userName: 'Dr. Rajesh Kumar', action: 'alert_reviewed', resource: 'alerts/a3', details: 'Reviewed bone pain alert for Meera Reddy', timestamp: '2026-03-30T09:00:00Z' },
  { id: 'al5', userId: 'u6', userName: 'Dr. Rajesh Kumar', action: 'clinician_note_added', resource: 'clinician_notes/cn1', details: 'Added note for Meera Reddy: ordering bone scan', timestamp: '2026-03-30T09:00:00Z' },
  { id: 'al6', userId: 'u8', userName: 'Admin User', action: 'user_login', resource: 'auth', details: 'Admin login successful', timestamp: '2026-04-01T08:00:00Z' },
  { id: 'al7', userId: 'u4', userName: 'Fatima Khan', action: 'symptom_report_created', resource: 'symptom_reports/sr4', details: 'Check-in routed to emergency escalation (emergency keywords matched)', timestamp: '2026-04-01T08:00:00Z' },
];

// =============================================
// Helper functions
// =============================================
export function getPatientById(id: string): Patient | undefined {
  return demoPatients.find(p => p.id === id);
}

export function getPatientByUserId(userId: string): Patient | undefined {
  return demoPatients.find(p => p.userId === userId);
}

export function getUserById(id: string): User | undefined {
  return demoUsers.find(u => u.id === id);
}

export function getSymptomReportsForPatient(patientId: string): SymptomReport[] {
  return demoSymptomReports.filter(sr => sr.patientId === patientId);
}

export function getDocumentsForPatient(patientId: string): UploadedDocument[] {
  return demoDocuments.filter(d => d.patientId === patientId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAlertsForClinician(_clinicianId?: string): Alert[] {
  return demoAlerts.sort((a, b) => {
    const severityOrder: Record<RoutingPriority, number> = { emergency: 0, urgent: 1, soon: 2, routine: 3 };
    return (severityOrder[a.severity] - severityOrder[b.severity]) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
}

export function getTimelineForPatient(patientId: string): TimelineEvent[] {
  return demoTimeline.filter(te => te.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * The patient record a signed-in patient or caregiver acts on.
 * Clinicians and admins are not tied to a single patient.
 */
export function getPatientForUser(user: User | null): Patient | undefined {
  if (!user) return undefined;
  if (user.role === 'patient') return getPatientByUserId(user.id);
  if (user.role === 'caregiver') return demoPatients.find(p => p.caregiverUserIds?.includes(user.id));
  return undefined;
}

export function getNotificationsForPatient(patientId: string): PatientNotification[] {
  return demoPatientNotifications
    .filter(n => n.patientId === patientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAlertsForPatient(patientId: string): Alert[] {
  return demoAlerts.filter(a => a.patientId === patientId);
}
