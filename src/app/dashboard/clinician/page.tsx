'use client';
import React, { useState } from 'react';
import {
  Users, AlertTriangle, Activity, Search, Check,
  Phone, Camera, Stethoscope, Send,
  Bell, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoPatients, demoAlerts, demoSymptomReports, demoClinicianNotes,
  getAlertsForClinician
} from '@/data/demoData';
import { format, parseISO } from 'date-fns';
import { UrgencyLevel, ClinicianAction } from '@/types';

function UrgencyChip({ level }: { level: UrgencyLevel }) {
  const classes: Record<string, string> = {
    routine: 'chip-routine', soon: 'chip-soon', urgent: 'chip-urgent', emergency: 'chip-emergency',
  };
  const labels: Record<string, string> = {
    routine: '● Routine', soon: '● Soon', urgent: '● Urgent', emergency: '🚨 Emergency',
  };
  return <span className={classes[level]}>{labels[level]}</span>;
}

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

  const actions: { value: ClinicianAction; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'reviewed', label: 'Mark Reviewed', icon: Check, color: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' },
    { value: 'contact_patient', label: 'Contact Patient', icon: Phone, color: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300' },
    { value: 'request_imaging', label: 'Request Imaging', icon: Camera, color: 'bg-caution-100 text-caution-700 dark:bg-caution-900 dark:text-caution-300' },
    { value: 'request_labs', label: 'Request Labs', icon: Activity, color: 'bg-caution-100 text-caution-700 dark:bg-caution-900 dark:text-caution-300' },
    { value: 'urgent_visit', label: 'Urgent Visit', icon: Stethoscope, color: 'bg-urgent-100 text-urgent-700 dark:bg-urgent-900 dark:text-urgent-300' },
    { value: 'emergency_referral', label: 'Emergency Referral', icon: AlertTriangle, color: 'bg-emergency-100 text-emergency-700 dark:bg-emergency-900 dark:text-emergency-300' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinician Dashboard</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {user?.name || 'Dr. Rajesh Kumar'} • {demoPatients.length} patients • {urgentAlerts.length} urgent alerts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Patients</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoPatients.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-emergency-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Urgent Alerts</span>
          </div>
          <p className="text-2xl font-bold text-emergency-600">{urgentAlerts.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-caution-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Pending Reports</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{recentReports.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-accent-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Notes Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoClinicianNotes.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {[
          { key: 'alerts', label: 'Alerts Queue', badge: urgentAlerts.length },
          { key: 'patients', label: 'All Patients' },
          { key: 'recent', label: 'Recent Submissions' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'patients' | 'alerts' | 'recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--card-bg)] shadow-card text-foreground'
                : 'text-surface-500 hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.badge && tab.badge > 0 ? (
              <span className="ml-1.5 w-5 h-5 inline-flex items-center justify-center rounded-full bg-emergency-500 text-white text-2xs font-bold">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Alerts Queue */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`card p-5 border-l-4 animate-fade-in ${
                alert.severity === 'emergency' ? 'border-l-emergency-500' :
                alert.severity === 'urgent' ? 'border-l-urgent-500' :
                alert.severity === 'soon' ? 'border-l-caution-500' : 'border-l-primary-500'
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <UrgencyChip level={alert.severity} />
                    <span className="text-xs text-surface-400">{format(parseISO(alert.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{alert.patientName}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                  alert.status === 'new' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' :
                  'bg-surface-100 text-surface-500 dark:bg-surface-800'
                }`}>
                  {alert.status}
                </span>
              </div>

              <p className="text-sm text-foreground mb-1">{alert.message}</p>
              <p className="text-xs text-surface-500 leading-relaxed mb-4">{alert.details}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {actions.slice(0, 4).map(action => (
                  <button
                    key={action.value}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 ${action.color}`}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowNoteForm(showNoteForm === alert.id ? null : alert.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200"
                >
                  <Send className="w-3.5 h-3.5" />
                  Add Note
                </button>
              </div>

              {/* Note Form */}
              {showNoteForm === alert.id && (
                <div className="mt-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 animate-slide-down">
                  <textarea
                    className="input-field text-sm min-h-[80px] resize-y mb-2"
                    placeholder="Add a clinical note for this patient..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowNoteForm(null)} className="btn-ghost text-xs">Cancel</button>
                    <button onClick={() => { setShowNoteForm(null); setNoteText(''); }} className="btn-primary text-xs">Save Note</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Patients */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search patients by name or city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredPatients.map((patient, i) => {
              const patientAlerts = demoAlerts.filter(a => a.patientId === patient.id && !a.isRead);
              const hasUrgent = patientAlerts.some(a => a.severity === 'urgent' || a.severity === 'emergency');

              return (
                <div
                  key={patient.id}
                  className={`card p-4 hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in ${
                    hasUrgent ? 'border-l-4 border-l-urgent-500' : ''
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{patient.user.name}</h3>
                        {patientAlerts.length > 0 && (
                          <span className="w-5 h-5 rounded-full bg-emergency-500 text-white text-2xs flex items-center justify-center font-bold">
                            {patientAlerts.length}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-surface-500 space-y-0.5">
                        <p>{patient.age}F • {patient.city} • Stage {patient.cancerStage} • {patient.receptorStatus.join('/')}</p>
                        <p>{patient.treatmentCenter} • {patient.distanceFromCenter}km away</p>
                        <p>Follow-up: {patient.followUpFrequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-surface-400">
                        {patient.medications.filter(m => m.isActive).length} active meds
                      </p>
                      <div className="mt-1">
                        {patientAlerts.map(a => (
                          <UrgencyChip key={a.id} level={a.severity} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {activeTab === 'recent' && (
        <div className="space-y-3">
          {recentReports.map((report, i) => {
            const patient = demoPatients.find(p => p.id === report.patientId);
            return (
              <div
                key={report.id}
                className="card p-4 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{patient?.user.name}</p>
                    <p className="text-xs text-surface-400">{format(parseISO(report.createdAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                  {report.triageResult && <UrgencyChip level={report.triageResult.urgencyLevel} />}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {report.symptoms.map(s => (
                    <span key={s.name} className="text-2xs px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-medium">
                      {s.label} ({s.severity})
                    </span>
                  ))}
                </div>
                {report.freeText && (
                  <p className="text-xs text-surface-500 italic leading-relaxed">&ldquo;{report.freeText.substring(0, 150)}...&rdquo;</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
