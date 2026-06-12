'use client';
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, Minus,
  Brain, AlertTriangle, Users, Zap, ChevronDown, ChevronUp,
  Clock, Shield, Sparkles
} from 'lucide-react';
import { inpatients, InpatientRecord, getTrendDirection, computeNEWS2 } from '@/data/labData';
import { format, parseISO } from 'date-fns';

// =============================================
// Types & Helpers
// =============================================
type LabKey = keyof InpatientRecord['labs'];
type VitalKey = keyof InpatientRecord['vitals'];

function TrendIcon({ direction }: { direction: 'rising' | 'falling' | 'stable' }) {
  if (direction === 'rising') return <TrendingUp className="w-4 h-4 text-emergency-500" />;
  if (direction === 'falling') return <TrendingDown className="w-4 h-4 text-primary-500" />;
  return <Minus className="w-4 h-4 text-surface-400" />;
}

function AlertBadge({ level }: { level: 'normal' | 'low' | 'critical' }) {
  const styles = {
    normal: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
    low: 'bg-caution-100 text-caution-700 dark:bg-caution-950 dark:text-caution-300',
    critical: 'bg-emergency-100 text-emergency-700 dark:bg-emergency-950 dark:text-emergency-300',
  };
  const labels = { normal: '● Stable', low: '⚠ Monitor', critical: '🚨 Critical' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function NEWS2Badge({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-emergency-500' : score >= 5 ? 'bg-urgent-500' : score >= 3 ? 'bg-caution-500' : 'bg-primary-500';
  const label = score >= 7 ? 'HIGH RISK' : score >= 5 ? 'MEDIUM' : score >= 3 ? 'LOW-MED' : 'LOW';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${color} text-white`}>
      <span className="text-sm font-bold">{score}</span>
      <span className="text-2xs font-medium">{label}</span>
    </div>
  );
}

// =============================================
// Sparkline (mini trend chart)
// =============================================
function Sparkline({ data, color = '#6366f1', refLow, refHigh }: {
  data: { date: string; value: number }[];
  color?: string;
  refLow?: number;
  refHigh?: number;
}) {
  const latest = data[data.length - 1]?.value ?? 0;
  const isOutOfRange = refLow !== undefined && refHigh !== undefined &&
    (latest < refLow || latest > refHigh);

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isOutOfRange ? '#ef4444' : color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isOutOfRange ? '#ef4444' : color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={isOutOfRange ? '#ef4444' : color}
          strokeWidth={2}
          fill={`url(#grad-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// =============================================
// Full Line Chart with reference range
// =============================================
function LabChart({ param, color = '#6366f1' }: {
  param: { name: string; unit: string; refLow: number; refHigh: number; data: { date: string; value: number }[] };
  color?: string;
}) {
  const chartData = param.data.map(d => ({
    date: format(parseISO(d.date), 'MMM d'),
    value: d.value,
  }));

  const minVal = Math.min(...param.data.map(d => d.value), param.refLow);
  const maxVal = Math.max(...param.data.map(d => d.value), param.refHigh);
  const padding = (maxVal - minVal) * 0.15;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[minVal - padding, maxVal + padding]}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(v) => v !== undefined ? [`${Number(v).toFixed(2)} ${param.unit}`, param.name] : ['--', param.name]}
        />
        <ReferenceLine y={param.refHigh} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'High', position: 'right', fontSize: 9, fill: '#f59e0b' }} />
        <ReferenceLine y={param.refLow} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Low', position: 'right', fontSize: 9, fill: '#f59e0b' }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// =============================================
// Groq Analysis Panel
// =============================================
interface GroqAnalysis {
  summary: string;
  urgencyLevel: 'normal' | 'low' | 'critical';
  trends: { parameter: string; change: string; concern: string }[];
  alerts: string[];
  suggestedActions: string[];
  disclaimer: string;
}

function GroqAnalysisPanel({ patient, onClose }: { patient: InpatientRecord; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GroqAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    // Build lab trend summary for Groq
    const labSummary = Object.entries(patient.labs).map(([, param]) => {
      const values = param.data.map(d => d.value).join(' → ');
      const latest = param.data[param.data.length - 1].value;
      const inRange = latest >= param.refLow && latest <= param.refHigh;
      return `- ${param.name} (${param.unit}): ${values} [ref: ${param.refLow}-${param.refHigh}] ${inRange ? '✓' : '⚠ OUT OF RANGE'}`;
    }).join('\n');

    const vitalSummary = Object.entries(patient.vitals).map(([, param]) => {
      const values = param.data.map(d => d.value).join(' → ');
      const latest = param.data[param.data.length - 1].value;
      const inRange = latest >= param.refLow && latest <= param.refHigh;
      return `- ${param.name} (${param.unit}): ${values} [ref: ${param.refLow}-${param.refHigh}] ${inRange ? '✓' : '⚠ OUT OF RANGE'}`;
    }).join('\n');

    const userMessage = `Analyze the following 7-day longitudinal lab and vital sign data for a hospital inpatient:

PATIENT: ${patient.name}, ${patient.age}${patient.sex}, ${patient.ward}
DIAGNOSIS: ${patient.diagnosis}
CURRENT NEWS2 SCORE: ${patient.news2Score} (${patient.news2Trend})

SERIAL LABORATORY VALUES (oldest → newest, last 7 days):
${labSummary}

SERIAL VITAL SIGNS (oldest → newest, last 7 days):
${vitalSummary}

PRIMARY CLINICAL CONCERN: ${patient.primaryConcern}

Please perform a comprehensive longitudinal trend analysis and identify any concerning deterioration patterns. Return your response as valid JSON matching the specified format.`;

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'lab_analysis',
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setAnalysis(json.data);
      } else if (json.success && json.raw) {
        // Try to parse raw
        try {
          const match = json.raw.match(/\{[\s\S]*\}/);
          if (match) setAnalysis(JSON.parse(match[0]));
          else setError('Could not parse AI response. Raw: ' + json.raw.slice(0, 200));
        } catch {
          setError('Parse error: ' + json.raw.slice(0, 300));
        }
      } else {
        setError(json.error || 'Analysis failed');
      }
    } catch (e) {
      setError('Network error: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Groq AI Trend Analysis</h2>
            <p className="text-xs text-surface-400">Powered by Llama 3.3 70B • {patient.name}</p>
          </div>
        </div>

        {!analysis && !loading && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-primary-400 mx-auto mb-3" />
            <p className="text-sm text-surface-500 mb-5 max-w-sm mx-auto">
              Send 7-day serial lab + vitals data to Groq AI for longitudinal deterioration analysis.
            </p>
            <button onClick={runAnalysis} className="btn-primary gap-2">
              <Zap className="w-4 h-4" />
              Run AI Analysis
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
            <p className="text-sm text-surface-400">Analyzing trends with Groq Llama 3.3...</p>
            <div className="space-y-2 w-full max-w-xs">
              <div className="skeleton h-3 rounded-full" />
              <div className="skeleton h-3 rounded-full w-4/5" />
              <div className="skeleton h-3 rounded-full w-3/5" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-emergency-50 dark:bg-emergency-950/50 border border-emergency-200 dark:border-emergency-800 mb-4">
            <p className="text-sm text-emergency-700 dark:text-emergency-300">{error}</p>
            <button onClick={runAnalysis} className="btn-secondary text-sm mt-3 gap-2">
              <Zap className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary */}
            <div className={`p-4 rounded-xl border ${
              analysis.urgencyLevel === 'critical'
                ? 'bg-emergency-50 dark:bg-emergency-950/50 border-emergency-200 dark:border-emergency-800'
                : analysis.urgencyLevel === 'low'
                ? 'bg-caution-50 dark:bg-caution-950/50 border-caution-200 dark:border-caution-800'
                : 'bg-primary-50 dark:bg-primary-950/50 border-primary-200 dark:border-primary-800'
            }`}>
              <div className="flex items-start gap-3">
                <AlertBadge level={analysis.urgencyLevel} />
                <p className="text-sm font-medium text-foreground leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* Trends */}
            {analysis.trends && analysis.trends.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Detected Trends</p>
                <div className="space-y-2">
                  {analysis.trends.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                      <TrendingUp className="w-4 h-4 text-caution-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.parameter}: <span className="font-normal text-surface-500">{t.change}</span></p>
                        <p className="text-xs text-surface-400 mt-0.5">{t.concern}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {analysis.alerts && analysis.alerts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Clinical Alerts</p>
                <div className="space-y-2">
                  {analysis.alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-caution-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Actions */}
            {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Suggested Clinical Actions</p>
                <div className="space-y-1.5">
                  {analysis.suggestedActions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-2xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-foreground">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <Shield className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-surface-400 leading-relaxed">{analysis.disclaimer}</p>
            </div>

            <button onClick={runAnalysis} className="btn-secondary w-full text-sm gap-2">
              <Zap className="w-3.5 h-3.5" /> Re-run Analysis
            </button>
          </div>
        )}

        <button onClick={onClose} className="btn-ghost w-full mt-4 text-sm">Close</button>
      </div>
    </div>
  );
}

// =============================================
// Patient Card (compact overview)
// =============================================
function PatientCard({
  patient,
  isSelected,
  onClick,
}: {
  patient: InpatientRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hbTrend = getTrendDirection(patient.labs.hemoglobin.data);
  const crTrend = getTrendDirection(patient.labs.creatinine.data);
  const spo2Trend = getTrendDirection(patient.vitals.spo2.data);
  const news2 = computeNEWS2(patient.vitals);

  return (
    <div
      onClick={onClick}
      className={`card p-4 cursor-pointer transition-all hover:shadow-elevated ${
        isSelected ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
      } ${patient.alertLevel === 'critical' ? 'border-l-4 border-l-emergency-500' : patient.alertLevel === 'low' ? 'border-l-4 border-l-caution-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-foreground text-sm">{patient.name}</p>
          <p className="text-2xs text-surface-400">{patient.age}{patient.sex} • {patient.bed}</p>
          <p className="text-2xs text-surface-400 truncate max-w-[180px]">{patient.diagnosis.split(',')[0]}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AlertBadge level={patient.alertLevel} />
          <NEWS2Badge score={news2} />
        </div>
      </div>

      {/* Mini sparklines row */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div>
          <p className="text-2xs text-surface-400 mb-1 flex items-center gap-0.5">
            Hb <TrendIcon direction={hbTrend} />
          </p>
          <Sparkline data={patient.labs.hemoglobin.data} color="#6366f1" refLow={patient.labs.hemoglobin.refLow} refHigh={patient.labs.hemoglobin.refHigh} />
          <p className="text-2xs text-center text-surface-500 mt-0.5">
            {patient.labs.hemoglobin.data[patient.labs.hemoglobin.data.length - 1].value} {patient.labs.hemoglobin.unit}
          </p>
        </div>
        <div>
          <p className="text-2xs text-surface-400 mb-1 flex items-center gap-0.5">
            Cr <TrendIcon direction={crTrend} />
          </p>
          <Sparkline data={patient.labs.creatinine.data} color="#f59e0b" refLow={patient.labs.creatinine.refLow} refHigh={patient.labs.creatinine.refHigh} />
          <p className="text-2xs text-center text-surface-500 mt-0.5">
            {patient.labs.creatinine.data[patient.labs.creatinine.data.length - 1].value} {patient.labs.creatinine.unit}
          </p>
        </div>
        <div>
          <p className="text-2xs text-surface-400 mb-1 flex items-center gap-0.5">
            SpO₂ <TrendIcon direction={spo2Trend} />
          </p>
          <Sparkline data={patient.vitals.spo2.data} color="#10b981" refLow={patient.vitals.spo2.refLow} refHigh={patient.vitals.spo2.refHigh} />
          <p className="text-2xs text-center text-surface-500 mt-0.5">
            {patient.vitals.spo2.data[patient.vitals.spo2.data.length - 1].value}%
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================
// Lab Detail Panel
// =============================================
const LAB_COLORS: Record<string, string> = {
  hemoglobin: '#6366f1',
  wbc: '#f59e0b',
  platelets: '#8b5cf6',
  creatinine: '#ef4444',
  sodium: '#06b6d4',
  potassium: '#f97316',
  alt: '#84cc16',
  bilirubin: '#ec4899',
};

const VITAL_COLORS: Record<string, string> = {
  spo2: '#10b981',
  heartRate: '#ef4444',
  systolicBP: '#8b5cf6',
  respiratoryRate: '#f59e0b',
  temperature: '#f97316',
};

function LabDetailPanel({ patient }: { patient: InpatientRecord }) {
  const [showLabs, setShowLabs] = useState(true);
  const [showVitals, setShowVitals] = useState(true);

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
            <p className="text-sm text-surface-500 mt-0.5">
              {patient.age}{patient.sex} • {patient.ward} • {patient.bed}
            </p>
            <p className="text-sm text-foreground mt-1">{patient.diagnosis}</p>
          </div>
          <div className="flex items-center gap-3">
            <AlertBadge level={patient.alertLevel} />
            <NEWS2Badge score={patient.news2Score} />
          </div>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${patient.alertLevel === 'critical' ? 'text-emergency-500' : patient.alertLevel === 'low' ? 'text-caution-500' : 'text-primary-500'}`} />
            <p className="text-sm text-foreground leading-relaxed">{patient.primaryConcern}</p>
          </div>
        </div>
        <p className="text-xs text-surface-400 mt-3 leading-relaxed">{patient.clinicalSummary}</p>
      </div>

      {/* Labs Section */}
      <div className="card">
        <button
          onClick={() => setShowLabs(!showLabs)}
          className="w-full flex items-center justify-between p-4 border-b border-[var(--card-border)]"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-foreground">Laboratory Trends — 7 Days</h3>
          </div>
          {showLabs ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
        </button>

        {showLabs && (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {(Object.keys(patient.labs) as LabKey[]).map(key => {
              const param = patient.labs[key];
              const trend = getTrendDirection(param.data);
              const latest = param.data[param.data.length - 1].value;
              const first = param.data[0].value;
              const delta = (latest - first).toFixed(1);
              const outOfRange = latest < param.refLow || latest > param.refHigh;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{param.name}</span>
                      <TrendIcon direction={trend} />
                      {outOfRange && (
                        <span className="text-2xs px-1.5 py-0.5 rounded bg-emergency-100 dark:bg-emergency-950 text-emergency-700 dark:text-emergency-300 font-bold">
                          OUT OF RANGE
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{latest}</span>
                      <span className="text-2xs text-surface-400 ml-1">{param.unit}</span>
                      <span className={`text-2xs ml-1 font-medium ${Number(delta) > 0 ? 'text-emergency-500' : Number(delta) < 0 ? 'text-primary-500' : 'text-surface-400'}`}>
                        ({Number(delta) > 0 ? '+' : ''}{delta})
                      </span>
                    </div>
                  </div>
                  <LabChart param={param} color={LAB_COLORS[key] || '#6366f1'} />
                  <p className="text-2xs text-surface-400">
                    Ref: {param.refLow}–{param.refHigh} {param.unit}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vitals Section */}
      <div className="card">
        <button
          onClick={() => setShowVitals(!showVitals)}
          className="w-full flex items-center justify-between p-4 border-b border-[var(--card-border)]"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emergency-500" />
            <h3 className="font-semibold text-foreground">Physiological Monitoring — 7 Days</h3>
          </div>
          {showVitals ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
        </button>

        {showVitals && (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(patient.vitals) as VitalKey[]).map(key => {
              const param = patient.vitals[key];
              const trend = getTrendDirection(param.data);
              const latest = param.data[param.data.length - 1].value;
              const outOfRange = latest < param.refLow || latest > param.refHigh;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{param.name}</span>
                      <TrendIcon direction={trend} />
                      {outOfRange && (
                        <span className="text-2xs px-1.5 py-0.5 rounded bg-emergency-100 dark:bg-emergency-950 text-emergency-700 dark:text-emergency-300 font-bold">⚠</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-foreground">{latest} <span className="text-2xs text-surface-400 font-normal">{param.unit}</span></span>
                  </div>
                  <LabChart param={param} color={VITAL_COLORS[key] || '#6366f1'} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// Main Page
// =============================================
export default function LabTrendsPage() {
  const [selectedPatient, setSelectedPatient] = useState<InpatientRecord>(inpatients[0]);
  const [showGroqPanel, setShowGroqPanel] = useState(false);

  const criticalCount = inpatients.filter(p => p.alertLevel === 'critical').length;
  const monitorCount = inpatients.filter(p => p.alertLevel === 'low').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Lab Trend Monitor</h1>
          </div>
          <p className="text-sm text-surface-500">
            Longitudinal laboratory & physiological data — 7-day trends with AI deterioration analysis
          </p>
        </div>
        <button
          onClick={() => setShowGroqPanel(true)}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          <Brain className="w-4 h-4" />
          Groq AI Analysis
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Inpatients</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{inpatients.length}</p>
          <p className="text-xs text-surface-400 mt-1">monitored today</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-emergency-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Critical</span>
          </div>
          <p className="text-2xl font-bold text-emergency-600">{criticalCount}</p>
          <p className="text-xs text-surface-400 mt-1">urgent review needed</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-caution-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Monitor</span>
          </div>
          <p className="text-2xl font-bold text-caution-600">{monitorCount}</p>
          <p className="text-xs text-surface-400 mt-1">close monitoring</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">AI Powered</span>
          </div>
          <p className="text-sm font-bold text-foreground">Groq</p>
          <p className="text-xs text-surface-400 mt-1">Llama 3.3 70B</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Patient List */}
        <div className="lg:w-80 flex-shrink-0 space-y-3">
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" /> Inpatient List
          </h2>
          {inpatients.map(p => (
            <PatientCard
              key={p.id}
              patient={p}
              isSelected={selectedPatient.id === p.id}
              onClick={() => setSelectedPatient(p)}
            />
          ))}
        </div>

        {/* Detail Panel */}
        <div className="flex-1 min-w-0">
          <LabDetailPanel patient={selectedPatient} />
        </div>
      </div>

      {/* Groq AI Panel Modal */}
      {showGroqPanel && (
        <GroqAnalysisPanel
          patient={selectedPatient}
          onClose={() => setShowGroqPanel(false)}
        />
      )}
    </div>
  );
}
