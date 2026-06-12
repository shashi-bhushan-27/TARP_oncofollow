// =============================================
// LCIIS — Longitudinal Lab & Vital Signs Data
// Simulates 5 inpatients with 7 days of serial data
// =============================================

export type TrendDirection = 'rising' | 'falling' | 'stable';
export type AlertLevel = 'normal' | 'low' | 'critical';

export interface LabDataPoint {
  date: string; // ISO date string
  value: number;
}

export interface LabParameter {
  name: string;
  unit: string;
  refLow: number;
  refHigh: number;
  data: LabDataPoint[];
}

export interface VitalParameter {
  name: string;
  unit: string;
  refLow: number;
  refHigh: number;
  data: LabDataPoint[];
}

export interface InpatientRecord {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F';
  ward: string;
  bed: string;
  diagnosis: string;
  admissionDate: string;
  attendingDoctor: string;
  clinicalSummary: string;
  labs: {
    hemoglobin: LabParameter;
    wbc: LabParameter;
    platelets: LabParameter;
    creatinine: LabParameter;
    sodium: LabParameter;
    potassium: LabParameter;
    alt: LabParameter;
    bilirubin: LabParameter;
  };
  vitals: {
    spo2: VitalParameter;
    heartRate: VitalParameter;
    systolicBP: VitalParameter;
    respiratoryRate: VitalParameter;
    temperature: VitalParameter;
  };
  news2Score: number;
  news2Trend: TrendDirection;
  primaryConcern: string;
  alertLevel: AlertLevel;
}

// =============================================
// Helper: generate date series (last 7 days)
// =============================================
function days(valuesFromOldest: number[], daysBack = 7): LabDataPoint[] {
  const today = new Date();
  return valuesFromOldest.map((value, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (daysBack - 1 - i));
    return { date: d.toISOString().split('T')[0], value };
  });
}

// =============================================
// Patient 1 — Post-surgical declining Hb (slow GI bleed)
// =============================================
const patient1: InpatientRecord = {
  id: 'ip1',
  name: 'Ramesh Verma',
  age: 58,
  sex: 'M',
  ward: 'General Surgery — Ward 3',
  bed: 'Bed 12',
  diagnosis: 'Post-operative Day 5 — Open Cholecystectomy, suspected slow GI bleed',
  admissionDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  attendingDoctor: 'Dr. Rajesh Kumar',
  clinicalSummary: 'Post-operative cholecystectomy patient with gradual decline in hemoglobin over 5 days. No overt bleeding observed, but Hb trend is concerning for occult loss. WBC and platelets normal.',
  labs: {
    hemoglobin: {
      name: 'Hemoglobin',
      unit: 'g/dL',
      refLow: 13.0,
      refHigh: 17.0,
      data: days([13.8, 13.2, 12.4, 11.7, 10.9, 10.1, 9.4]),
    },
    wbc: {
      name: 'WBC',
      unit: '×10³/μL',
      refLow: 4.0,
      refHigh: 11.0,
      data: days([8.4, 9.1, 9.6, 10.2, 10.8, 11.3, 11.9]),
    },
    platelets: {
      name: 'Platelets',
      unit: '×10³/μL',
      refLow: 150,
      refHigh: 400,
      data: days([245, 238, 231, 224, 218, 211, 205]),
    },
    creatinine: {
      name: 'Creatinine',
      unit: 'mg/dL',
      refLow: 0.7,
      refHigh: 1.3,
      data: days([0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.2]),
    },
    sodium: {
      name: 'Sodium',
      unit: 'mEq/L',
      refLow: 136,
      refHigh: 145,
      data: days([141, 140, 139, 138, 137, 136, 135]),
    },
    potassium: {
      name: 'Potassium',
      unit: 'mEq/L',
      refLow: 3.5,
      refHigh: 5.0,
      data: days([4.1, 4.0, 3.9, 3.8, 3.7, 3.6, 3.5]),
    },
    alt: {
      name: 'ALT',
      unit: 'U/L',
      refLow: 7,
      refHigh: 56,
      data: days([32, 35, 38, 40, 42, 44, 46]),
    },
    bilirubin: {
      name: 'Total Bilirubin',
      unit: 'mg/dL',
      refLow: 0.1,
      refHigh: 1.2,
      data: days([0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]),
    },
  },
  vitals: {
    spo2: {
      name: 'SpO₂',
      unit: '%',
      refLow: 95,
      refHigh: 100,
      data: days([98, 98, 97, 97, 96, 96, 95]),
    },
    heartRate: {
      name: 'Heart Rate',
      unit: 'bpm',
      refLow: 60,
      refHigh: 100,
      data: days([72, 74, 78, 82, 88, 94, 102]),
    },
    systolicBP: {
      name: 'Systolic BP',
      unit: 'mmHg',
      refLow: 100,
      refHigh: 140,
      data: days([132, 128, 124, 118, 112, 105, 98]),
    },
    respiratoryRate: {
      name: 'Respiratory Rate',
      unit: '/min',
      refLow: 12,
      refHigh: 20,
      data: days([14, 14, 15, 15, 16, 17, 18]),
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      refLow: 36.0,
      refHigh: 37.5,
      data: days([36.8, 37.0, 37.2, 37.4, 37.6, 37.8, 38.1]),
    },
  },
  news2Score: 5,
  news2Trend: 'rising',
  primaryConcern: 'Hemoglobin falling 4.4 g/dL over 7 days — possible occult bleeding',
  alertLevel: 'low',
};

// =============================================
// Patient 2 — AKI developing (rising creatinine)
// =============================================
const patient2: InpatientRecord = {
  id: 'ip2',
  name: 'Sunita Agarwal',
  age: 65,
  sex: 'F',
  ward: 'Medicine — Ward 6',
  bed: 'Bed 4',
  diagnosis: 'Sepsis — UTI origin, developing Acute Kidney Injury',
  admissionDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  attendingDoctor: 'Dr. Sunita Mehta',
  clinicalSummary: 'Elderly female admitted with UTI-origin sepsis. Creatinine rising steadily over 6 days despite antibiotic therapy, suggestive of AKI progression. Urine output declining. Potassium trending up.',
  labs: {
    hemoglobin: {
      name: 'Hemoglobin',
      unit: 'g/dL',
      refLow: 12.0,
      refHigh: 16.0,
      data: days([11.2, 11.0, 10.8, 10.6, 10.5, 10.3, 10.1]),
    },
    wbc: {
      name: 'WBC',
      unit: '×10³/μL',
      refLow: 4.0,
      refHigh: 11.0,
      data: days([18.4, 16.2, 14.1, 12.8, 11.6, 10.4, 9.8]),
    },
    platelets: {
      name: 'Platelets',
      unit: '×10³/μL',
      refLow: 150,
      refHigh: 400,
      data: days([188, 172, 160, 148, 135, 124, 112]),
    },
    creatinine: {
      name: 'Creatinine',
      unit: 'mg/dL',
      refLow: 0.6,
      refHigh: 1.1,
      data: days([1.2, 1.5, 1.9, 2.4, 2.9, 3.5, 4.2]),
    },
    sodium: {
      name: 'Sodium',
      unit: 'mEq/L',
      refLow: 136,
      refHigh: 145,
      data: days([138, 137, 136, 135, 134, 133, 131]),
    },
    potassium: {
      name: 'Potassium',
      unit: 'mEq/L',
      refLow: 3.5,
      refHigh: 5.0,
      data: days([4.2, 4.4, 4.6, 4.9, 5.1, 5.4, 5.7]),
    },
    alt: {
      name: 'ALT',
      unit: 'U/L',
      refLow: 7,
      refHigh: 56,
      data: days([28, 30, 32, 35, 38, 42, 46]),
    },
    bilirubin: {
      name: 'Total Bilirubin',
      unit: 'mg/dL',
      refLow: 0.1,
      refHigh: 1.2,
      data: days([0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 1.7]),
    },
  },
  vitals: {
    spo2: {
      name: 'SpO₂',
      unit: '%',
      refLow: 95,
      refHigh: 100,
      data: days([96, 96, 95, 95, 94, 93, 92]),
    },
    heartRate: {
      name: 'Heart Rate',
      unit: 'bpm',
      refLow: 60,
      refHigh: 100,
      data: days([108, 104, 100, 96, 94, 90, 88]),
    },
    systolicBP: {
      name: 'Systolic BP',
      unit: 'mmHg',
      refLow: 100,
      refHigh: 140,
      data: days([98, 100, 102, 105, 108, 110, 112]),
    },
    respiratoryRate: {
      name: 'Respiratory Rate',
      unit: '/min',
      refLow: 12,
      refHigh: 20,
      data: days([22, 21, 20, 20, 21, 22, 23]),
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      refLow: 36.0,
      refHigh: 37.5,
      data: days([39.2, 38.6, 38.0, 37.6, 37.4, 37.3, 37.2]),
    },
  },
  news2Score: 7,
  news2Trend: 'rising',
  primaryConcern: 'Creatinine rising from 1.2 → 4.2 mg/dL over 7 days — AKI Stage 3',
  alertLevel: 'critical',
};

// =============================================
// Patient 3 — Respiratory deterioration (declining SpO₂)
// =============================================
const patient3: InpatientRecord = {
  id: 'ip3',
  name: 'Arjun Nair',
  age: 72,
  sex: 'M',
  ward: 'Respiratory ICU — Ward 1',
  bed: 'Bed 2',
  diagnosis: 'Community-acquired pneumonia, COPD exacerbation',
  admissionDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  attendingDoctor: 'Dr. Rajesh Kumar',
  clinicalSummary: 'Elderly COPD patient with community-acquired pneumonia. SpO₂ declining despite antibiotics and supplemental oxygen. Respiratory rate persistently elevated. CRP and WBC trending down but respiratory parameters worsening.',
  labs: {
    hemoglobin: {
      name: 'Hemoglobin',
      unit: 'g/dL',
      refLow: 13.0,
      refHigh: 17.0,
      data: days([14.2, 14.0, 13.8, 13.6, 13.5, 13.4, 13.2]),
    },
    wbc: {
      name: 'WBC',
      unit: '×10³/μL',
      refLow: 4.0,
      refHigh: 11.0,
      data: days([14.8, 13.2, 12.1, 11.4, 10.8, 10.2, 9.8]),
    },
    platelets: {
      name: 'Platelets',
      unit: '×10³/μL',
      refLow: 150,
      refHigh: 400,
      data: days([312, 318, 325, 330, 338, 344, 350]),
    },
    creatinine: {
      name: 'Creatinine',
      unit: 'mg/dL',
      refLow: 0.7,
      refHigh: 1.3,
      data: days([1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.3]),
    },
    sodium: {
      name: 'Sodium',
      unit: 'mEq/L',
      refLow: 136,
      refHigh: 145,
      data: days([139, 138, 137, 136, 136, 135, 135]),
    },
    potassium: {
      name: 'Potassium',
      unit: 'mEq/L',
      refLow: 3.5,
      refHigh: 5.0,
      data: days([3.8, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4]),
    },
    alt: {
      name: 'ALT',
      unit: 'U/L',
      refLow: 7,
      refHigh: 56,
      data: days([22, 24, 26, 28, 30, 32, 35]),
    },
    bilirubin: {
      name: 'Total Bilirubin',
      unit: 'mg/dL',
      refLow: 0.1,
      refHigh: 1.2,
      data: days([0.8, 0.9, 0.9, 1.0, 1.0, 1.1, 1.2]),
    },
  },
  vitals: {
    spo2: {
      name: 'SpO₂',
      unit: '%',
      refLow: 95,
      refHigh: 100,
      data: days([93, 92, 91, 90, 89, 88, 87]),
    },
    heartRate: {
      name: 'Heart Rate',
      unit: 'bpm',
      refLow: 60,
      refHigh: 100,
      data: days([96, 98, 100, 102, 104, 106, 108]),
    },
    systolicBP: {
      name: 'Systolic BP',
      unit: 'mmHg',
      refLow: 100,
      refHigh: 140,
      data: days([128, 126, 124, 122, 120, 118, 116]),
    },
    respiratoryRate: {
      name: 'Respiratory Rate',
      unit: '/min',
      refLow: 12,
      refHigh: 20,
      data: days([24, 25, 26, 27, 28, 29, 30]),
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      refLow: 36.0,
      refHigh: 37.5,
      data: days([38.4, 38.1, 37.8, 37.6, 37.4, 37.3, 37.2]),
    },
  },
  news2Score: 9,
  news2Trend: 'rising',
  primaryConcern: 'SpO₂ falling from 93% → 87% over 7 days despite O₂ therapy — escalation may be needed',
  alertLevel: 'critical',
};

// =============================================
// Patient 4 — Electrolyte instability (K+ swings)
// =============================================
const patient4: InpatientRecord = {
  id: 'ip4',
  name: 'Deepa Krishnan',
  age: 44,
  sex: 'F',
  ward: 'Cardiology — Ward 4',
  bed: 'Bed 8',
  diagnosis: 'Heart failure exacerbation, on diuretic therapy — electrolyte monitoring',
  admissionDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  attendingDoctor: 'Dr. Sunita Mehta',
  clinicalSummary: 'Patient with known dilated cardiomyopathy admitted for decompensated heart failure. On IV furosemide. Potassium fluctuating — requires daily monitoring to prevent arrhythmia risk.',
  labs: {
    hemoglobin: {
      name: 'Hemoglobin',
      unit: 'g/dL',
      refLow: 12.0,
      refHigh: 16.0,
      data: days([12.8, 12.6, 12.5, 12.4, 12.3, 12.2, 12.1]),
    },
    wbc: {
      name: 'WBC',
      unit: '×10³/μL',
      refLow: 4.0,
      refHigh: 11.0,
      data: days([7.2, 7.0, 6.8, 6.6, 6.5, 6.4, 6.3]),
    },
    platelets: {
      name: 'Platelets',
      unit: '×10³/μL',
      refLow: 150,
      refHigh: 400,
      data: days([195, 192, 188, 184, 181, 178, 175]),
    },
    creatinine: {
      name: 'Creatinine',
      unit: 'mg/dL',
      refLow: 0.6,
      refHigh: 1.1,
      data: days([1.4, 1.5, 1.6, 1.5, 1.6, 1.7, 1.8]),
    },
    sodium: {
      name: 'Sodium',
      unit: 'mEq/L',
      refLow: 136,
      refHigh: 145,
      data: days([132, 133, 134, 135, 134, 133, 132]),
    },
    potassium: {
      name: 'Potassium',
      unit: 'mEq/L',
      refLow: 3.5,
      refHigh: 5.0,
      data: days([3.2, 2.9, 3.4, 3.1, 2.8, 3.3, 3.0]),
    },
    alt: {
      name: 'ALT',
      unit: 'U/L',
      refLow: 7,
      refHigh: 56,
      data: days([48, 52, 55, 58, 54, 50, 48]),
    },
    bilirubin: {
      name: 'Total Bilirubin',
      unit: 'mg/dL',
      refLow: 0.1,
      refHigh: 1.2,
      data: days([1.4, 1.5, 1.6, 1.5, 1.5, 1.6, 1.7]),
    },
  },
  vitals: {
    spo2: {
      name: 'SpO₂',
      unit: '%',
      refLow: 95,
      refHigh: 100,
      data: days([94, 95, 96, 96, 95, 95, 94]),
    },
    heartRate: {
      name: 'Heart Rate',
      unit: 'bpm',
      refLow: 60,
      refHigh: 100,
      data: days([88, 86, 84, 82, 80, 82, 84]),
    },
    systolicBP: {
      name: 'Systolic BP',
      unit: 'mmHg',
      refLow: 100,
      refHigh: 140,
      data: days([102, 105, 108, 110, 108, 106, 104]),
    },
    respiratoryRate: {
      name: 'Respiratory Rate',
      unit: '/min',
      refLow: 12,
      refHigh: 20,
      data: days([20, 19, 18, 18, 19, 20, 21]),
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      refLow: 36.0,
      refHigh: 37.5,
      data: days([36.8, 36.7, 36.8, 36.9, 36.8, 36.7, 36.8]),
    },
  },
  news2Score: 4,
  news2Trend: 'stable',
  primaryConcern: 'Potassium fluctuating below 3.5 mEq/L on 4 of 7 days — arrhythmia risk with diuretic therapy',
  alertLevel: 'low',
};

// =============================================
// Patient 5 — Stable recovery (normal trends)
// =============================================
const patient5: InpatientRecord = {
  id: 'ip5',
  name: 'Mohan Das',
  age: 50,
  sex: 'M',
  ward: 'General Medicine — Ward 5',
  bed: 'Bed 15',
  diagnosis: 'Typhoid fever — improving on IV antibiotics',
  admissionDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  attendingDoctor: 'Dr. Rajesh Kumar',
  clinicalSummary: 'Patient admitted with typhoid fever (blood culture positive). On IV ceftriaxone for 6 days. Fever resolving, WBC normalizing, labs improving. Expected discharge in 2-3 days.',
  labs: {
    hemoglobin: {
      name: 'Hemoglobin',
      unit: 'g/dL',
      refLow: 13.0,
      refHigh: 17.0,
      data: days([12.0, 12.2, 12.4, 12.6, 12.8, 13.0, 13.2]),
    },
    wbc: {
      name: 'WBC',
      unit: '×10³/μL',
      refLow: 4.0,
      refHigh: 11.0,
      data: days([14.2, 12.8, 11.4, 10.2, 9.1, 8.2, 7.4]),
    },
    platelets: {
      name: 'Platelets',
      unit: '×10³/μL',
      refLow: 150,
      refHigh: 400,
      data: days([142, 155, 168, 182, 198, 215, 232]),
    },
    creatinine: {
      name: 'Creatinine',
      unit: 'mg/dL',
      refLow: 0.7,
      refHigh: 1.3,
      data: days([1.1, 1.0, 0.9, 0.9, 0.8, 0.8, 0.8]),
    },
    sodium: {
      name: 'Sodium',
      unit: 'mEq/L',
      refLow: 136,
      refHigh: 145,
      data: days([136, 137, 138, 139, 140, 140, 141]),
    },
    potassium: {
      name: 'Potassium',
      unit: 'mEq/L',
      refLow: 3.5,
      refHigh: 5.0,
      data: days([3.6, 3.8, 4.0, 4.1, 4.2, 4.2, 4.3]),
    },
    alt: {
      name: 'ALT',
      unit: 'U/L',
      refLow: 7,
      refHigh: 56,
      data: days([68, 62, 55, 48, 42, 36, 30]),
    },
    bilirubin: {
      name: 'Total Bilirubin',
      unit: 'mg/dL',
      refLow: 0.1,
      refHigh: 1.2,
      data: days([1.8, 1.6, 1.4, 1.2, 1.0, 0.8, 0.7]),
    },
  },
  vitals: {
    spo2: {
      name: 'SpO₂',
      unit: '%',
      refLow: 95,
      refHigh: 100,
      data: days([97, 97, 98, 98, 98, 99, 99]),
    },
    heartRate: {
      name: 'Heart Rate',
      unit: 'bpm',
      refLow: 60,
      refHigh: 100,
      data: days([98, 94, 90, 86, 82, 78, 74]),
    },
    systolicBP: {
      name: 'Systolic BP',
      unit: 'mmHg',
      refLow: 100,
      refHigh: 140,
      data: days([118, 120, 122, 124, 126, 128, 130]),
    },
    respiratoryRate: {
      name: 'Respiratory Rate',
      unit: '/min',
      refLow: 12,
      refHigh: 20,
      data: days([20, 19, 18, 17, 16, 15, 14]),
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      refLow: 36.0,
      refHigh: 37.5,
      data: days([39.1, 38.6, 38.0, 37.6, 37.4, 37.2, 36.9]),
    },
  },
  news2Score: 1,
  news2Trend: 'falling',
  primaryConcern: 'Improving — all parameters trending toward normal. Discharge expected in 2-3 days.',
  alertLevel: 'normal',
};

export const inpatients: InpatientRecord[] = [patient1, patient2, patient3, patient4, patient5];

// =============================================
// Helper: compute trend direction for a parameter
// =============================================
export function getTrendDirection(data: LabDataPoint[]): TrendDirection {
  if (data.length < 2) return 'stable';
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const delta = last - first;
  const threshold = Math.abs(first) * 0.05; // 5% change threshold
  if (delta > threshold) return 'rising';
  if (delta < -threshold) return 'falling';
  return 'stable';
}

// =============================================
// Helper: compute NEWS2 score from vitals
// =============================================
export function computeNEWS2(vitals: InpatientRecord['vitals']): number {
  const latest = (param: VitalParameter) => param.data[param.data.length - 1]?.value ?? 0;
  let score = 0;

  // Respiratory rate
  const rr = latest(vitals.respiratoryRate);
  if (rr <= 8) score += 3;
  else if (rr <= 11) score += 1;
  else if (rr <= 20) score += 0;
  else if (rr <= 24) score += 2;
  else score += 3;

  // SpO2
  const spo2 = latest(vitals.spo2);
  if (spo2 <= 91) score += 3;
  else if (spo2 <= 93) score += 2;
  else if (spo2 <= 95) score += 1;

  // HR
  const hr = latest(vitals.heartRate);
  if (hr <= 40) score += 3;
  else if (hr <= 50) score += 1;
  else if (hr <= 90) score += 0;
  else if (hr <= 110) score += 1;
  else if (hr <= 130) score += 2;
  else score += 3;

  // Systolic BP
  const bp = latest(vitals.systolicBP);
  if (bp <= 90) score += 3;
  else if (bp <= 100) score += 2;
  else if (bp <= 110) score += 1;
  else if (bp <= 219) score += 0;
  else score += 3;

  // Temperature
  const temp = latest(vitals.temperature);
  if (temp <= 35.0) score += 3;
  else if (temp <= 36.0) score += 1;
  else if (temp <= 38.0) score += 0;
  else if (temp <= 39.0) score += 1;
  else score += 2;

  return score;
}
