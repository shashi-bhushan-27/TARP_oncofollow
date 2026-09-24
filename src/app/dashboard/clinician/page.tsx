'use client';
import React, { useState } from 'react';
import {
  AlertTriangle, Activity, Search, Check,
  Phone, Camera, Stethoscope, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoPatients, demoAlerts, demoSymptomReports, demoClinicianNotes,
  getAlertsForClinician
} from '@/data/demoData';
import { format, parseISO } from 'date-fns';
import { ClinicianAction, RoutingPriority } from '@/types';
import { RoutingChip } from '@/components/RoutingChip';

const RULE: Record<RoutingPriority, string> = {
  emergency: 'bg-emergency-600',
  urgent: 'bg-urgent-500',
  soon: 'bg-caution-500',
  routine: 'bg-primary-500',
};

export default function ClinicianDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'patients' | 'alerts' | 'recent'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');

  const [noteText, setNoteText] = useState('');
  const [showNoteForm, setShowNoteForm] = useState<string | null>(null);

  const alerts = getAlertsForClinician();
  const urgentAlerts = alerts.filter(a => a.severity === 'emergency' || a.severity === 'urgent');
  const recentReports = demoSymptomReports;

  const filteredPatients = demoPatients.filter(p =>
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actions: { value: ClinicianAction; label: string; icon: React.ElementType }[] = [
    { value: 'reviewed', label: 'Mark reviewed', icon: Check },
    { value: 'contact_patient', label: 'Contact patient', icon: Phone },
    { value: 'request_imaging', label: 'Request imaging', icon: Camera },
    { value: 'request_labs', label: 'Request labs', icon: Activity },
    { value: 'urgent_visit', label: 'Urgent visit', icon: Stethoscope },
    { value: 'emergency_referral', label: 'Emergency referral', icon: AlertTriangle },
  ];

  const stats = [
    { label: 'Patients', value: demoPatients.length },
    { label: 'Urgent or emergency', value: urgentAlerts.length, emphasis: urgentAlerts.length > 0 },
    { label: 'Check-ins to review', value: recentReports.length },
    { label: 'Notes today', value: demoClinicianNotes.length },
  ];

  const tabs: { key: 'alerts' | 'patients' | 'recent'; label: string; count?: number }[] = [
    { key: 'alerts', label: 'Alerts queue', count: alerts.length },
    { key: 'patients', label: 'Patients', count: demoPatients.length },
    { key: 'recent', label: 'Recent check-ins', count: recentReports.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <p className="eyebrow mb-2">{format(new Date(), 'EEEE, d MMMM')}</p>
        <h1 className="page-title">Care team overview</h1>
        <p className="text-muted mt-1">{user?.name || 'Dr. Rajesh Kumar'} · Oncology follow-up</p>
      </header>

      {/* Counts */}
      <section className="card grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--card-border)]" aria-label="Summary">
        {stats.map(s => (
          <div key={s.label} className="p-5">
            <p className={`text-3xl font-semibold tabular-nums ${s.emphasis ? 'text-emergency-700 dark:text-emergency-300' : 'text-foreground'}`}>
              {s.value}
            </p>
            <p className="text-sm text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div role="tablist" className="flex gap-6 border-b border-[var(--card-border)]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'tab-active' : 'tab'}
          >
            {tab.label}
            {tab.count !== undefined && <span className="ml-1.5 text-subtle font-normal tabular-nums">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Alerts Queue */}
      {activeTab === 'alerts' && (
        alerts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-medium text-foreground">The queue is clear</p>
            <p className="text-sm text-muted mt-1">New check-ins will appear here as soon as they are routed.</p>
          </div>
        ) : (
          <ul className="card divide-y divide-[var(--card-border)] overflow-hidden">
            {alerts.map(alert => (
              <li key={alert.id} className="relative pl-6 pr-5 py-5 sm:pl-7">
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${RULE[alert.severity]}`} aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <RoutingChip priority={alert.severity} />
                  <span className="text-sm font-semibold text-foreground">{alert.patientName}</span>
                  <span className="text-xs text-subtle">{format(parseISO(alert.createdAt), 'd MMM, h:mm a')}</span>
                  <span className={`ml-auto text-xs font-medium capitalize ${alert.status === 'new' ? 'text-primary-700 dark:text-primary-300' : 'text-subtle'}`}>
                    {alert.status}
                  </span>
                </div>

                <p className="text-foreground">{alert.message}</p>
                <p className="text-sm text-muted mt-1 max-w-3xl">{alert.details}</p>

                <div className="flex flex-wrap gap-1 mt-4 -ml-2">
                  {actions.slice(0, 4).map(action => (
                    <button key={action.value} className="btn-ghost !min-h-[36px] !px-2 text-sm">
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNoteForm(showNoteForm === alert.id ? null : alert.id)}
                    aria-expanded={showNoteForm === alert.id}
                    className="btn-ghost !min-h-[36px] !px-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Add note
                  </button>
                </div>

                {showNoteForm === alert.id && (
                  <div className="mt-3 panel p-4 animate-slide-down">
                    <label className="label" htmlFor={`note-${alert.id}`}>Note for {alert.patientName}</label>
                    <textarea
                      id={`note-${alert.id}`}
                      className="input-field min-h-[80px] resize-y mb-3"
                      placeholder="What you did or decided"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowNoteForm(null)} className="btn-ghost">Cancel</button>
                      <button onClick={() => { setShowNoteForm(null); setNoteText(''); }} className="btn-primary">Save note</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}

      {/* All Patients */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by name or city"
              aria-label="Search patients"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  {['Patient', 'Treatment centre', 'Follow-up', 'Medicines', 'Open alerts'].map(h => (
                    <th key={h} scope="col" className="eyebrow !font-semibold px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredPatients.map(patient => {
                  const patientAlerts = demoAlerts.filter(a => a.patientId === patient.id && !a.isRead);
                  return (
                    <tr key={patient.id} className="align-top hover:bg-[var(--hover-bg)] transition-colors duration-150">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground">{patient.user.name}</p>
                        <p className="text-xs text-subtle">{patient.age} · {patient.city} · Stage {patient.cancerStage} · {patient.receptorStatus.join('/')}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {patient.treatmentCenter}
                        <span className="block text-xs text-subtle">{patient.distanceFromCenter} km away</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{patient.followUpFrequency}</td>
                      <td className="px-5 py-4 text-sm text-muted tabular-nums">{patient.medications.filter(m => m.isActive).length}</td>
                      <td className="px-5 py-4">
                        {patientAlerts.length === 0 ? (
                          <span className="text-sm text-subtle">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {patientAlerts.map(a => <RoutingChip key={a.id} priority={a.severity} />)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <p className="px-5 py-8 text-sm text-muted">No patients match &ldquo;{searchTerm}&rdquo;.</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {activeTab === 'recent' && (
        <ul className="card divide-y divide-[var(--card-border)]">
          {recentReports.map(report => {
            const patient = demoPatients.find(p => p.id === report.patientId);
            return (
              <li key={report.id} className="p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <p className="text-sm font-semibold text-foreground">{patient?.user.name}</p>
                  <span className="text-xs text-subtle">{format(parseISO(report.createdAt), 'd MMM yyyy, h:mm a')}</span>
                  {report.triageResult && <span className="ml-auto"><RoutingChip priority={report.triageResult.routingPriority} /></span>}
                </div>
                <p className="text-sm text-muted">
                  {report.symptoms.map(s => `${s.label} (${s.severity})`).join(' · ')}
                </p>
                {report.freeText && (
                  <p className="text-sm text-foreground mt-2 border-l-2 border-[var(--plane-strong)] pl-3">
                    &ldquo;{report.freeText.length > 180 ? `${report.freeText.substring(0, 180)}…` : report.freeText}&rdquo;
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
