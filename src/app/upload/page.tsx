'use client';
import React, { useState, useCallback } from 'react';
import {
  Upload, FileText, Check, X, Eye, Search
} from 'lucide-react';
import { ReportType, BodyRegion } from '@/types';

const reportTypes: { value: ReportType; label: string }[] = [
  { value: 'xray', label: 'X-ray' }, { value: 'ct_scan', label: 'CT Scan' },
  { value: 'mri', label: 'MRI' }, { value: 'blood_report', label: 'Blood Report' },
  { value: 'pathology', label: 'Pathology Report' }, { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'prescription', label: 'Prescription' }, { value: 'mammogram', label: 'Mammogram' },
  { value: 'pet_scan', label: 'PET Scan' }, { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'other', label: 'Other' },
];

const bodyRegions: { value: BodyRegion; label: string }[] = [
  { value: 'chest', label: 'Chest' }, { value: 'breast', label: 'Breast' },
  { value: 'brain', label: 'Brain' }, { value: 'bone', label: 'Bone' },
  { value: 'liver', label: 'Liver' }, { value: 'abdomen', label: 'Abdomen' },
  { value: 'whole_body', label: 'Whole Body' }, { value: 'blood', label: 'Blood' },
  { value: 'other', label: 'Other' },
];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const [parsedData, setParsedData] = useState({
    reportType: 'xray' as ReportType,
    reportDate: '2026-03-25',
    hospital: 'AIIMS Delhi',
    bodyRegion: 'chest' as BodyRegion,
    keyFindings: '',
    impression: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const processFile = (f: File) => {
    setFile(f);
    setIsProcessing(true);

    // Simulate OCR/parsing
    setTimeout(() => {
      setParsedData({
        reportType: f.name.includes('xray') || f.name.includes('chest') ? 'xray' : 
                     f.name.includes('blood') || f.name.includes('cbc') ? 'blood_report' : 'other',
        reportDate: '2026-03-25',
        hospital: 'AIIMS Delhi',
        bodyRegion: f.name.includes('chest') ? 'chest' : f.name.includes('blood') ? 'blood' : 'other',
        keyFindings: 'Small 1.2cm nodule noted in the right lower lobe. No pleural effusion. Heart size normal.',
        impression: 'Right lower lobe pulmonary nodule. Recommend CT chest with contrast for further characterization.',
      });
      setIsProcessing(false);
      setStep('preview');
    }, 1500);
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Medical Report</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Upload your X-ray, CT, blood work, or any medical document
        </p>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div
          className={`card p-12 border-2 border-dashed text-center transition-colors ${
            dragActive
              ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-950/30'
              : 'border-[var(--card-border)]'
          }`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Drag and drop your report here</p>
          <p className="text-sm text-surface-400 mb-4">PDF, JPG, PNG — up to 20MB</p>
          <label className="btn-primary text-sm cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Choose File
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.dcm"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-primary-600 animate-pulse-soft" />
          </div>
          <p className="font-medium text-foreground mb-2">Analyzing your document...</p>
          <p className="text-sm text-surface-400">Extracting text and identifying key findings</p>
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded-full mx-auto" />
            <div className="skeleton h-3 w-1/2 rounded-full mx-auto" />
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && !isProcessing && (
        <div className="space-y-4">
          {/* File info */}
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-950 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{file?.name || 'document.pdf'}</p>
              <p className="text-xs text-surface-400">{file ? `${(file.size / 1024).toFixed(1)} KB` : '--'}</p>
            </div>
            <button onClick={() => { setFile(null); setStep('upload'); }} className="btn-ghost text-xs text-emergency-600">
              Remove
            </button>
          </div>

          {/* Parsed Metadata */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-600" />
              Extracted Information
            </h2>
            <p className="text-xs text-surface-400">Please verify and correct any details below</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Report Type</label>
                <select
                  className="input-field text-sm"
                  value={parsedData.reportType}
                  onChange={e => setParsedData(p => ({ ...p, reportType: e.target.value as ReportType }))}
                >
                  {reportTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Report Date</label>
                <input
                  type="date"
                  className="input-field text-sm"
                  value={parsedData.reportDate}
                  onChange={e => setParsedData(p => ({ ...p, reportDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Hospital / Lab</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  value={parsedData.hospital}
                  onChange={e => setParsedData(p => ({ ...p, hospital: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Body Region</label>
                <select
                  className="input-field text-sm"
                  value={parsedData.bodyRegion}
                  onChange={e => setParsedData(p => ({ ...p, bodyRegion: e.target.value as BodyRegion }))}
                >
                  {bodyRegions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Key Findings</label>
              <textarea
                className="input-field text-sm min-h-[80px] resize-y"
                value={parsedData.keyFindings}
                onChange={e => setParsedData(p => ({ ...p, keyFindings: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Impression / Conclusion</label>
              <textarea
                className="input-field text-sm min-h-[60px] resize-y"
                value={parsedData.impression}
                onChange={e => setParsedData(p => ({ ...p, impression: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="btn-secondary flex-1">
              <X className="w-4 h-4 mr-2" /> Cancel
            </button>
            <button onClick={handleConfirm} className="btn-primary flex-1">
              <Check className="w-4 h-4 mr-2" /> Confirm & Save
            </button>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {step === 'confirm' && (
        <div className="card p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Saved Successfully</h2>
          <p className="text-sm text-surface-400 mb-6">
            Your {reportTypes.find(t => t.value === parsedData.reportType)?.label || 'report'} has been added to your timeline and is available for your care team.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setFile(null); setStep('upload'); }} className="btn-secondary text-sm">
              Upload Another
            </button>
            <a href="/timeline" className="btn-primary text-sm">
              View Timeline
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
