'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Check, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CancerStage, TreatmentType } from '@/types';

const steps = ['Personal Info', 'Cancer Details', 'Treatment History', 'Care Team & Consent'];

export default function OnboardingPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    name: '', age: '', sex: 'female', city: '', preferredLanguage: 'English', distanceFromCenter: '',
    diagnosisDate: '', cancerStage: '' as CancerStage, receptorStatus: [] as string[],
    treatments: [] as TreatmentType[],
    surgeryDetails: '', chemoDetails: '', radiationDetails: '', hormoneDetails: '',
    treatmentCenter: '', primaryDoctor: '',
    emergencyName: '', emergencyPhone: '', emergencyRelationship: '',
    followUpFrequency: 'Every 3 months',
    consent: false,
  });

  const update = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleReceptor = (r: string) => {
    setFormData(prev => ({
      ...prev,
      receptorStatus: prev.receptorStatus.includes(r)
        ? prev.receptorStatus.filter(x => x !== r)
        : [...prev.receptorStatus, r],
    }));
  };

  const toggleTreatment = (t: TreatmentType) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.includes(t)
        ? prev.treatments.filter(x => x !== t)
        : [...prev.treatments, t],
    }));
  };

  const handleComplete = () => {
    login('u1'); // Demo: log in as Priya Sharma
    router.push('/dashboard/patient');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground">OncoFollow</p>
            <p className="text-2xs text-surface-400">Patient Registration</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
              }`}>
                {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${
                  i < currentStep ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm font-medium text-surface-500">{steps[currentStep]}</p>

        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input type="text" className="input-field" placeholder="e.g., Priya Sharma" value={formData.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" className="input-field" placeholder="e.g., 52" value={formData.age} onChange={e => update('age', e.target.value)} />
              </div>
              <div>
                <label className="label">Sex</label>
                <select className="input-field" value={formData.sex} onChange={e => update('sex', e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">City</label>
                <input type="text" className="input-field" placeholder="e.g., Delhi" value={formData.city} onChange={e => update('city', e.target.value)} />
              </div>
              <div>
                <label className="label">Preferred Language</label>
                <select className="input-field" value={formData.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)}>
                  {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Distance from treatment center (km)</label>
                <input type="number" className="input-field" placeholder="e.g., 25" value={formData.distanceFromCenter} onChange={e => update('distanceFromCenter', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Cancer Details */}
        {currentStep === 1 && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div>
              <label className="label">Date of Diagnosis</label>
              <input type="date" className="input-field" value={formData.diagnosisDate} onChange={e => update('diagnosisDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Cancer Stage</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {(['I', 'IA', 'IB', 'II', 'IIA', 'IIB', 'III', 'IIIA', 'IIIB', 'IIIC', 'IV'] as CancerStage[]).map(stage => (
                  <button
                    key={stage}
                    onClick={() => update('cancerStage', stage)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                      formData.cancerStage === stage
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-foreground hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Receptor Status (if known)</label>
              <div className="flex flex-wrap gap-2">
                {['ER+', 'ER-', 'PR+', 'PR-', 'HER2+', 'HER2-', 'Triple Negative'].map(r => (
                  <button
                    key={r}
                    onClick={() => toggleReceptor(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      formData.receptorStatus.includes(r)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-foreground hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Treatment History */}
        {currentStep === 2 && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div>
              <label className="label">Treatments received (select all)</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'surgery', label: 'Surgery' },
                  { value: 'chemotherapy', label: 'Chemotherapy' },
                  { value: 'radiation', label: 'Radiation' },
                  { value: 'hormone_therapy', label: 'Hormone Therapy' },
                  { value: 'targeted_therapy', label: 'Targeted Therapy' },
                  { value: 'immunotherapy', label: 'Immunotherapy' },
                ] as { value: TreatmentType; label: string }[]).map(t => (
                  <button
                    key={t.value}
                    onClick={() => toggleTreatment(t.value)}
                    className={`p-3 rounded-xl border text-left text-sm font-medium transition-colors ${
                      formData.treatments.includes(t.value)
                        ? 'bg-primary-50 dark:bg-primary-950 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-foreground hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Care Team & Consent */}
        {currentStep === 3 && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Treatment Center / Hospital</label>
                <input type="text" className="input-field" placeholder="e.g., AIIMS Delhi" value={formData.treatmentCenter} onChange={e => update('treatmentCenter', e.target.value)} />
              </div>
              <div>
                <label className="label">Primary Doctor</label>
                <input type="text" className="input-field" placeholder="e.g., Dr. Kumar" value={formData.primaryDoctor} onChange={e => update('primaryDoctor', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Follow-up Frequency</label>
              <select className="input-field" value={formData.followUpFrequency} onChange={e => update('followUpFrequency', e.target.value)}>
                <option>Every month</option>
                <option>Every 3 months</option>
                <option>Every 6 months</option>
                <option>Yearly</option>
              </select>
            </div>

            <div className="border-t border-[var(--card-border)] pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Emergency Contact</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input type="text" className="input-field" value={formData.emergencyName} onChange={e => update('emergencyName', e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input-field" value={formData.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} />
                </div>
                <div>
                  <label className="label">Relationship</label>
                  <input type="text" className="input-field" value={formData.emergencyRelationship} onChange={e => update('emergencyRelationship', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--card-border)] pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  checked={formData.consent}
                  onChange={e => update('consent', e.target.checked)}
                />
                <span className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                  I consent to the collection and use of my health information for follow-up support through OncoFollow.
                  I understand this tool does not replace my doctor&apos;s diagnosis and is for support purposes only.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(s => s - 1)} className="btn-secondary flex-1 gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(s => s + 1)} className="btn-primary flex-1 gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!formData.consent}
              className="btn-primary flex-1 gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Complete Registration
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
