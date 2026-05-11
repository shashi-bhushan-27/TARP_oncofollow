// =============================================
// OncoFollow — Rich Demo Data
// =============================================
import {
  User, Patient, SymptomReport, UploadedDocument, Alert, ClinicianNote,
  TimelineEvent, GuidelineDocument, AIAssessment, AuditLog, UrgencyLevel
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
      { id: 'f1', dueDate: '2025-08-15', type: 'Clinical exam + blood work', status: 'completed', notes: 'All normal' },
      { id: 'f2', dueDate: '2025-11-15', type: 'Clinical exam + mammogram', status: 'completed', notes: 'No recurrence detected' },
      { id: 'f3', dueDate: '2026-02-15', type: 'Clinical exam + blood work', status: 'completed', notes: 'CBC normal, liver enzymes within limits' },
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
      { id: 'f5', dueDate: '2025-11-20', type: 'Clinical exam', status: 'completed', notes: 'Routine. No concerns.' },
      { id: 'f6', dueDate: '2026-02-20', type: 'Clinical exam + mammogram', status: 'completed', notes: 'All clear' },
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
    treatmentHistory: [
      { id: 'th16', type: 'surgery', name: 'Mastectomy with Reconstruction', startDate: '2025-04-15', endDate: '2025-04-15', details: 'Implant-based reconstruction. Clear margins. All nodes negative.', hospital: 'Ruby Hall Clinic' },
      { id: 'th17', type: 'chemotherapy', name: 'TC Regimen', startDate: '2025-05-20', endDate: '2025-08-15', details: '4 cycles. Mild side effects.', hospital: 'Ruby Hall Clinic' },
      { id: 'th18', type: 'hormone_therapy', name: 'Anastrozole 1mg', startDate: '2025-09-01', details: 'Adjuvant therapy.', hospital: 'Ruby Hall Clinic' },
    ],
    medications: [
      { id: 'm10', name: 'Anastrozole', dosage: '1mg', frequency: 'Once daily', startDate: '2025-09-01', isActive: true },
    ],
    followUpSchedule: [
      { id: 'f10', dueDate: '2026-03-01', type: 'Clinical exam + mammogram', status: 'completed', notes: 'Satisfactory' },
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
      urgencyLevel: 'urgent',
      explanation: 'A persistent worsening cough lasting 3 weeks with chest discomfort in a breast cancer survivor (Stage IIA, completed treatment 8 months ago) raises concern for possible pulmonary involvement. Your recent chest X-ray shows a small nodule that needs further evaluation. This combination of symptoms warrants prompt medical attention.',
      recommendedActions: [
        'Schedule an urgent appointment with your oncologist within the next few days',
        'Get a CT scan of the chest for detailed evaluation of the lung nodule',
        'Complete blood work including tumor markers (CA 15-3, CEA)',
        'Keep a daily log of your cough and any new symptoms',
      ],
      suggestedTests: ['CT Chest with contrast', 'Tumor markers (CA 15-3, CEA)', 'Complete blood count', 'Liver function tests'],
      redFlagTriggers: [],
      confidenceBand: 'high',
      citations: [
        { id: 'c1', label: '[R1]', sourceType: 'record', sourceId: 'doc1', sourceTitle: 'Chest X-ray PA View — Mar 2026', snippet: 'Small 1.2cm nodule noted in the right lower lobe. Recommend CT correlation.', date: '2026-03-25' },
        { id: 'c2', label: '[R2]', sourceType: 'record', sourceId: 'th2', sourceTitle: 'Treatment Summary — AC-T Chemotherapy', snippet: 'Completed 4 cycles AC + 4 cycles Taxol. Stage IIA IDC, ER+/PR+/HER2-. 2/12 nodes positive.', date: '2025-02-28' },
        { id: 'c3', label: '[G1]', sourceType: 'guideline', sourceId: 'g1', sourceTitle: 'NCCN Breast Cancer Survivorship v2.2025', snippet: 'New persistent respiratory symptoms in breast cancer survivors should prompt chest imaging to evaluate for pulmonary metastasis. CT chest is preferred over plain radiography for detailed evaluation.' },
        { id: 'c4', label: '[G2]', sourceType: 'guideline', sourceId: 'g2', sourceTitle: 'ASCO Follow-up Recommendations', snippet: 'Patients with stage II-III breast cancer have a 10-15% risk of distant recurrence within the first 5 years. Lungs, bones, and liver are the most common metastatic sites.' },
      ],
      disclaimer: 'This tool is for follow-up support and does not replace a doctor\'s diagnosis. Please consult your oncology team for definitive evaluation.',
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
      urgencyLevel: 'routine',
      explanation: 'Minor fatigue lasting one week with no other symptoms and no worsening trend in a stable post-treatment patient is likely related to general factors. No red flags identified. Continue routine monitoring.',
      recommendedActions: [
        'Continue regular follow-up schedule',
        'Maintain balanced diet and light exercise',
        'If fatigue persists beyond 2-3 weeks or worsens, report again',
      ],
      suggestedTests: [],
      redFlagTriggers: [],
      confidenceBand: 'high',
      citations: [
        { id: 'c5', label: '[G1]', sourceType: 'guideline', sourceId: 'g3', sourceTitle: 'Cancer-Related Fatigue Guidelines', snippet: 'Mild fatigue is common in cancer survivors and may be related to multiple factors including stress, sleep, and activity levels. Persistent or worsening fatigue warrants evaluation.' },
      ],
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
      urgencyLevel: 'soon',
      explanation: 'New and worsening bone pain in the lower back, alongside increasing fatigue in a Stage IIIA HER2+ breast cancer patient, should be evaluated to rule out bone metastasis. While bone pain can have many causes, your cancer history and treatment stage make clinical evaluation important.',
      recommendedActions: [
        'Contact your oncologist to schedule an evaluation this week',
        'A bone scan or PET-CT may be needed to assess the spine',
        'Blood work including calcium, alkaline phosphatase, and tumor markers',
        'Continue pain management with Paracetamol as prescribed',
      ],
      suggestedTests: ['Bone scan or PET-CT', 'Serum calcium', 'Alkaline phosphatase', 'Tumor markers (CA 15-3)'],
      redFlagTriggers: [],
      confidenceBand: 'moderate',
      citations: [
        { id: 'c6', label: '[R1]', sourceType: 'record', sourceId: 'th8', sourceTitle: 'Treatment Summary — TCHP Neoadjuvant', snippet: 'Stage IIIA, HER2+, 3/14 nodes positive. Partial pathological response. Currently on maintenance trastuzumab.', date: '2024-12-30' },
        { id: 'c7', label: '[G1]', sourceType: 'guideline', sourceId: 'g2', sourceTitle: 'ASCO Follow-up Recommendations', snippet: 'New or persistent bone pain should be evaluated with appropriate imaging. Bone is the most common site of breast cancer metastasis, particularly in patients with advanced initial staging.' },
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
      urgencyLevel: 'emergency',
      explanation: 'URGENT — Severe new headache with vision changes and confusion in a breast cancer survivor requires IMMEDIATE emergency evaluation. These symptoms may indicate brain metastasis, increased intracranial pressure, or other serious conditions that need urgent imaging and assessment.',
      recommendedActions: [
        '🚨 Go to the nearest emergency department IMMEDIATELY',
        'Do NOT drive yourself — call an ambulance or have someone drive you',
        'Bring your cancer treatment records if readily available',
        'Inform the ER team about your breast cancer history',
      ],
      suggestedTests: ['Emergency CT/MRI Brain', 'Neurological examination', 'Ophthalmologic assessment'],
      redFlagTriggers: ['Severe headache with vision changes', 'Confusion symptoms reported'],
      confidenceBand: 'high',
      citations: [
        { id: 'c8', label: '[G1]', sourceType: 'guideline', sourceId: 'g1', sourceTitle: 'NCCN Breast Cancer Survivorship v2.2025', snippet: 'New neurological symptoms including severe headache, vision changes, seizures, or cognitive changes require emergent evaluation with brain imaging to rule out CNS metastasis.' },
        { id: 'c9', label: '[G2]', sourceType: 'guideline', sourceId: 'g4', sourceTitle: 'Emergency Oncology Reference', snippet: 'Acute neurological symptoms in cancer patients should be treated as oncological emergencies. Time to diagnosis and intervention directly impacts outcomes.' },
      ],
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
    message: 'Urgent: Worsening cough with suspicious chest X-ray finding',
    details: 'Patient reported persistent cough (3 weeks, worsening) with chest discomfort. Chest X-ray shows 1.2cm pulmonary nodule in right lower lobe. AI triage recommends urgent oncology review and CT chest.',
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
    message: '🚨 EMERGENCY: Severe headache with vision changes and confusion',
    details: 'Patient reported sudden severe headache, blurred vision, nausea, and confusion. Multiple red flags triggered. Symptoms suggestive of possible CNS involvement. Emergency evaluation required.',
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
    message: 'New bone pain requiring evaluation',
    details: 'Worsening lower back pain for 2 weeks with increasing fatigue. Stage IIIA HER2+ patient on trastuzumab maintenance. Bone scan suggested.',
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
    severity: 'urgent',
    message: 'New chest X-ray uploaded with finding requiring follow-up',
    details: 'Priya uploaded chest X-ray dated 25 Mar 2026. Automated parsing detected: "1.2cm nodule right lower lobe." This finding in a breast cancer survivor requires CT correlation. Flagged for clinician review.',
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
  { id: 'te8', patientId: 'p1', type: 'follow_up', title: 'Follow-up Visit — All Normal', description: 'Clinical exam and blood work. No concerns. CA 15-3 within normal limits.', date: '2025-08-15', urgencyLevel: 'routine' },
  { id: 'te9', patientId: 'p1', type: 'follow_up', title: 'Follow-up + Mammogram — Clear', description: 'Right breast mammogram BIRADS 1. Clinical exam normal. Continuing Tamoxifen.', date: '2025-11-15', urgencyLevel: 'routine' },
  { id: 'te10', patientId: 'p1', type: 'upload', title: 'Mammogram Report Uploaded', description: 'BIRADS 1 — Negative. No suspicious findings.', date: '2025-11-16' },
  { id: 'te11', patientId: 'p1', type: 'follow_up', title: 'Follow-up Visit — Routine', description: 'CBC normal. Liver enzymes within limits. No symptoms.', date: '2026-02-15', urgencyLevel: 'routine' },
  { id: 'te12', patientId: 'p1', type: 'upload', title: 'Chest X-ray Uploaded', description: '⚠️ 1.2cm nodule found in right lower lobe. CT recommended.', date: '2026-03-26', urgencyLevel: 'urgent' },
  { id: 'te13', patientId: 'p1', type: 'upload', title: 'CBC Report Uploaded', description: 'Mild anemia (Hb 11.2). ESR mildly elevated (28).', date: '2026-03-26' },
  { id: 'te14', patientId: 'p1', type: 'symptom', title: 'Symptom Report — Cough, Chest Pain, Fatigue', description: 'Persistent cough 3 weeks (worsening), mild chest pain, fatigue. AI triage: URGENT.', date: '2026-03-28', urgencyLevel: 'urgent' },
  { id: 'te15', patientId: 'p1', type: 'ai_alert', title: 'AI Escalation — Urgent Oncology Review', description: 'Worsening cough + suspicious lung nodule. CT chest recommended urgently. Oncology review needed.', date: '2026-03-28', urgencyLevel: 'urgent' },
];

// =============================================
// Guideline Documents (summarized)
// =============================================
export const demoGuidelines: GuidelineDocument[] = [
  {
    id: 'g1',
    title: 'NCCN Breast Cancer Survivorship Guidelines v2.2025',
    source: 'National Comprehensive Cancer Network',
    category: 'Survivorship',
    version: '2.2025',
    content: `FOLLOW-UP SCHEDULE FOR BREAST CANCER SURVIVORS:

HISTORY AND PHYSICAL EXAMINATION:
- Every 3-6 months for the first 3 years
- Every 6-12 months for years 4-5
- Annually thereafter

MAMMOGRAPHY:
- Annual diagnostic mammogram (contralateral or post-conservation)
- First mammogram 6-12 months after completion of radiation

IMAGING FOR METASTATIC SURVEILLANCE:
- Routine use of advanced imaging (CT, PET, bone scans) NOT recommended for asymptomatic patients
- Imaging should be driven by clinical symptoms or findings

SYMPTOMS REQUIRING PROMPT EVALUATION:
- New persistent cough, dyspnea → Chest imaging
- New bone pain, especially axial → Bone scan/imaging
- Neurological symptoms → Brain MRI
- Abdominal symptoms, elevated LFTs → Abdominal imaging/CT
- New skin nodules or lymphadenopathy → Clinical evaluation ± biopsy

RED FLAGS REQUIRING EMERGENCY EVALUATION:
- Hemoptysis
- Severe dyspnea
- New seizures
- Sudden focal neurological deficits
- Severe chest pain
- Cord compression symptoms (weakness, bladder dysfunction)

ENDOCRINE THERAPY MONITORING:
- Tamoxifen: Annual gynecological assessment, report abnormal bleeding
- Aromatase inhibitors: Bone density assessment at baseline and periodically`,
  },
  {
    id: 'g2',
    title: 'ASCO Follow-up Care Recommendations for Breast Cancer Survivors',
    source: 'American Society of Clinical Oncology',
    category: 'Follow-up',
    version: '2024',
    content: `ASCO RECOMMENDS:

CLINICAL VISITS: Every 3-6 months for first 3 years, then 6-12 months for 2 years, then annually.

IMPORTANT RISK INFORMATION:
- Stage II-III breast cancer: 10-15% risk of distant recurrence within 5 years
- ER+ cancers: Risk continues beyond 5 years (late recurrence possible)
- Most common sites of metastasis: Bone (40-75%), Lung (15-25%), Liver (5-15%), Brain (5-10%)
- HER2+ and triple-negative subtypes: Higher early recurrence risk

WHEN TO INVESTIGATE:
- New persistent bone pain → Bone scan, serum calcium, alkaline phosphatase
- New respiratory symptoms → Chest X-ray, then CT if abnormal
- Hepatic symptoms or elevated liver enzymes → Abdominal imaging
- Neurological symptoms → MRI brain with contrast

TUMOR MARKERS:
- Not recommended for routine surveillance
- May be useful in clinical context with symptoms (CA 15-3, CEA)

PATIENT EDUCATION:
- Breast self-awareness (not formal BSE)
- Report new symptoms promptly
- Maintain regular follow-up schedule
- Importance of adherence to endocrine therapy`,
  },
  {
    id: 'g3',
    title: 'Cancer-Related Fatigue: Assessment and Management',
    source: 'NCCN Clinical Practice Guidelines',
    category: 'Symptom Management',
    version: '2025',
    content: `CANCER-RELATED FATIGUE (CRF):
Defined as a distressing, persistent sense of physical, emotional, or cognitive exhaustion related to cancer or its treatment.

SCREENING:
- Screen all survivors at each visit using 0-10 scale
- Mild (1-3), Moderate (4-6), Severe (7-10)

EVALUATION OF MODERATE-SEVERE FATIGUE:
- Rule out recurrence
- Check for treatable causes: anemia, thyroid dysfunction, depression, sleep disorders, medication effects, deconditioning, pain, nutritional deficiencies

MANAGEMENT:
- Activity and exercise (most evidence-based intervention)
- Sleep hygiene
- Psychosocial support
- Nutritional optimization
- Treat underlying causes`,
  },
  {
    id: 'g4',
    title: 'Emergency Oncology: Red Flag Symptoms',
    source: 'OncoFollow Clinical Reference',
    category: 'Emergency',
    version: '1.0',
    content: `ONCOLOGICAL EMERGENCIES — BREAST CANCER SURVIVORS:

IMMEDIATE EMERGENCY (Call ambulance):
- Hemoptysis (coughing blood)
- Severe dyspnea at rest
- New seizures
- Sudden focal weakness or numbness
- Confusion or altered consciousness
- Severe chest pain
- Syncope
- Signs of spinal cord compression

URGENT EVALUATION (Same/next day):
- Persistent high fever (>103°F / 39.5°C) for >24 hours
- Rapidly worsening symptoms
- New severe bone pain preventing movement
- Persistent severe headache unresponsive to analgesics
- Significant weight loss (>10% in 3 months)
- New jaundice

SAFETY ESCALATION RULES:
1. If ANY immediate emergency flag is detected → bypass normal triage → EMERGENCY
2. If pattern matches brain metastasis presentation → EMERGENCY
3. If pattern matches cord compression → EMERGENCY
4. System must NEVER say "you do not need a doctor"
5. Always recommend professional evaluation alongside any assessment`,
  },
];

// =============================================
// AI Assessments
// =============================================
export const demoAIAssessments: AIAssessment[] = [
  {
    id: 'ai1',
    patientId: 'p1',
    symptomReportId: 'sr1',
    query: 'I have had a dry cough for 3 weeks that is getting worse, some chest pain when coughing, and I feel very tired.',
    response: `Based on your symptom report and medical records, here is my assessment:

**Concern Summary**
Your persistent cough lasting 3 weeks with worsening trend, combined with your breast cancer history (Stage IIA, completed treatment 8 months ago), warrants prompt evaluation. Your recent chest X-ray [R1] shows a 1.2cm pulmonary nodule in the right lower lobe that needs further characterization.

**Why This Is Concerning**
Breast cancer can recur in the lungs in 15-25% of metastatic cases [G2]. A new pulmonary nodule found on imaging in a breast cancer survivor, especially when accompanied by respiratory symptoms, requires urgent evaluation to determine if it represents metastatic disease, a new primary, or a benign finding.

**Your Triage Category: URGENT ONCOLOGY REVIEW**

**Recommended Next Steps**
1. Schedule an urgent appointment with Dr. Rajesh Kumar within the next few days
2. Get a CT scan of the chest with contrast for detailed nodule evaluation [G1]
3. Complete blood work including tumor markers (CA 15-3, CEA)
4. Your recent CBC [R2] shows mild anemia (Hb 11.2) and mildly elevated ESR (28) which should also be discussed

**Suggested Tests to Discuss with Your Doctor**
- CT Chest with contrast (priority)
- Tumor markers: CA 15-3, CEA
- Complete metabolic panel
- Consider PET-CT if CT shows concerning features

**Important Disclaimer**
This tool is for follow-up support and does not replace a doctor's diagnosis. The lung nodule may have many possible explanations — only your doctor can determine the cause through proper diagnostic evaluation. Please do not delay your appointment.`,
    urgencyLevel: 'urgent',
    explanation: 'Worsening respiratory symptoms + suspicious chest imaging in breast cancer survivor.',
    recommendedActions: ['Schedule urgent oncology appointment', 'CT Chest with contrast', 'Tumor markers', 'Complete blood work'],
    suggestedTests: ['CT Chest with contrast', 'CA 15-3', 'CEA', 'Complete metabolic panel'],
    citations: [
      { id: 'c1', label: '[R1]', sourceType: 'record', sourceId: 'doc1', sourceTitle: 'Chest X-ray PA View — Mar 2026', snippet: 'Small 1.2cm nodule noted in the right lower lobe.', date: '2026-03-25' },
      { id: 'c10', label: '[R2]', sourceType: 'record', sourceId: 'doc2', sourceTitle: 'CBC Report — Mar 2026', snippet: 'Hemoglobin 11.2 g/dL (low), ESR 28 mm/hr (elevated).', date: '2026-03-25' },
      { id: 'c3', label: '[G1]', sourceType: 'guideline', sourceId: 'g1', sourceTitle: 'NCCN Survivorship Guidelines', snippet: 'New persistent respiratory symptoms → chest imaging. CT preferred for detailed evaluation.' },
      { id: 'c4', label: '[G2]', sourceType: 'guideline', sourceId: 'g2', sourceTitle: 'ASCO Follow-up Recommendations', snippet: 'Most common sites of metastasis: Bone (40-75%), Lung (15-25%), Liver (5-15%), Brain (5-10%).' },
    ],
    redFlagTriggers: [],
    confidenceBand: 'high',
    mode: 'patient',
    createdAt: '2026-03-28T10:32:00Z',
    retrievedDocuments: [
      { id: 'rd1', title: 'Chest X-ray PA View — Mar 2026', type: 'record', date: '2026-03-25', relevanceScore: 0.95, snippet: '1.2cm nodule in right lower lobe...' },
      { id: 'rd2', title: 'CBC Report — Mar 2026', type: 'record', date: '2026-03-25', relevanceScore: 0.78, snippet: 'Hb 11.2, ESR 28...' },
      { id: 'rd3', title: 'Treatment Summary — Surgery', type: 'record', date: '2024-09-12', relevanceScore: 0.82, snippet: 'Stage IIA IDC, 2/12 nodes+...' },
      { id: 'rd4', title: 'NCCN Survivorship Guidelines', type: 'guideline', relevanceScore: 0.91, snippet: 'New persistent cough → chest imaging...' },
      { id: 'rd5', title: 'ASCO Follow-up Recommendations', type: 'guideline', relevanceScore: 0.88, snippet: 'Lung metastasis in 15-25% of cases...' },
    ],
    reasoningSummary: 'The system retrieved the patient\'s recent chest X-ray showing a pulmonary nodule, CBC showing mild anemia, and treatment history confirming Stage IIA breast cancer with node-positive disease. Combined with worsening respiratory symptoms, NCCN and ASCO guidelines indicate this pattern warrants urgent evaluation with CT chest to rule out pulmonary metastasis.',
  },
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
  { id: 'al7', userId: 'u4', userName: 'Fatima Khan', action: 'symptom_report_created', resource: 'symptom_reports/sr4', details: 'EMERGENCY: Severe headache, vision changes, confusion', timestamp: '2026-04-01T08:00:00Z' },
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
    const severityOrder: Record<UrgencyLevel, number> = { emergency: 0, urgent: 1, soon: 2, routine: 3 };
    return (severityOrder[a.severity] - severityOrder[b.severity]) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
}

export function getTimelineForPatient(patientId: string): TimelineEvent[] {
  return demoTimeline.filter(te => te.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAlertsForPatient(patientId: string): Alert[] {
  return demoAlerts.filter(a => a.patientId === patientId);
}
