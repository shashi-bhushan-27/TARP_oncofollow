'use client';
import React from 'react';
import Link from 'next/link';
import {
  Activity, FileText, Brain, Clock, Mic, Upload,
  Calendar, Pill, AlertTriangle, ChevronRight,
  ArrowRight, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoPatients, demoSymptomReports, demoDocuments,
  demoAlerts, demoTimeline, getPatientByUserId
} from '@/data/demoData';
import { format, differenceInDays, parseISO } from 'date-fns';

function UrgencyChip({ level }: { level: string }) {
  const classes: Record<string, string> = {
    routine: 'chip-routine',
    soon: 'chip-soon',
    urgent: 'chip-urgent',
    emergency: 'chip-emergency',
  };
  const labels: Record<string, string> = {
    routine: '● Routine',
    soon: '● Contact Soon',
    urgent: '● Urgent Review',
    emergency: '🚨 Emergency',
  };
  return <span className={classes[level] || 'chip-routine'}>{labels[level] || level}</span>;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const patient = user ? getPatientByUserId(user.id) : demoPatients[0];
  if (!patient) return null;

  const recentReports = demoSymptomReports.filter(r => r.patientId === patient.id);
  const documents = demoDocuments.filter(d => d.patientId === patient.id);
  const alerts = demoAlerts.filter(a => a.patientId === patient.id && !a.isRead);
  const timeline = demoTimeline.filter(t => t.patientId === patient.id).slice(0, 5);

  const nextFollowUp = patient.followUpSchedule.find(f => f.status === 'scheduled');
  const daysUntilFollowUp = nextFollowUp ? differenceInDays(parseISO(nextFollowUp.dueDate), new Date()) : null;

  const activeMeds = patient.medications.filter(m => m.isActive);
  const lastSymptomReport = recentReports[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {patient.user.name.split(' ')[0]}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            {patient.cancerStage} {patient.receptorStatus.join('/')} • {patient.treatmentCenter}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/symptoms" className="btn-primary text-sm gap-2">
            <Activity className="w-4 h-4" />
            Report Symptoms
          </Link>
          <Link href="/assistant" className="btn-secondary text-sm gap-2">
            <Brain className="w-4 h-4" />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 2).map(alert => (
            <Link
              key={alert.id}
              href="/alerts"
              className={`block p-4 rounded-2xl border transition-all hover:shadow-elevated ${
                alert.severity === 'emergency'
                  ? 'bg-emergency-50 dark:bg-emergency-950/50 border-emergency-200 dark:border-emergency-800'
                  : alert.severity === 'urgent'
                  ? 'bg-urgent-50 dark:bg-urgent-950/50 border-urgent-200 dark:border-urgent-800'
                  : 'bg-caution-50 dark:bg-caution-950/50 border-caution-200 dark:border-caution-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'emergency' ? 'text-emergency-600' :
                  alert.severity === 'urgent' ? 'text-urgent-600' : 'text-caution-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <UrgencyChip level={alert.severity} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Follow-up */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Next Follow-up</span>
          </div>
          {nextFollowUp ? (
            <div>
              <p className="text-xl font-bold text-foreground">
                {daysUntilFollowUp !== null && daysUntilFollowUp >= 0 ? `${daysUntilFollowUp} days` : 'Overdue'}
              </p>
              <p className="text-xs text-surface-400 mt-1">
                {format(parseISO(nextFollowUp.dueDate), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">{nextFollowUp.type}</p>
            </div>
          ) : (
            <p className="text-sm text-surface-400">No upcoming</p>
          )}
        </div>

        {/* Reports Uploaded */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Reports</span>
          </div>
          <p className="text-xl font-bold text-foreground">{documents.length}</p>
          <p className="text-xs text-surface-400 mt-1">uploaded documents</p>
          <Link href="/upload" className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-2 inline-flex items-center gap-1 hover:underline">
            Upload new <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Medications */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-caution-600 dark:text-caution-400" />
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Medications</span>
          </div>
          <p className="text-xl font-bold text-foreground">{activeMeds.length}</p>
          <div className="mt-1 space-y-0.5">
            {activeMeds.slice(0, 2).map(med => (
              <p key={med.id} className="text-xs text-surface-400 truncate">{med.name} {med.dosage}</p>
            ))}
          </div>
        </div>

        {/* Last Check-in */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Last Check-in</span>
          </div>
          {lastSymptomReport ? (
            <div>
              <UrgencyChip level={lastSymptomReport.triageResult?.urgencyLevel || 'routine'} />
              <p className="text-xs text-surface-400 mt-2">
                {format(parseISO(lastSymptomReport.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-surface-400">No check-ins yet</p>
          )}
        </div>
      </div>

      {/* Today's Check-in Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-1">How are you feeling today?</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
              Regular symptom check-ins help your care team monitor your recovery. It only takes a minute.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/symptoms" className="btn-primary text-sm gap-2">
                <Activity className="w-4 h-4" />
                Start Check-in
              </Link>
              <Link href="/symptoms?voice=true" className="btn-secondary text-sm gap-2">
                <Mic className="w-4 h-4" />
                Voice Note
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { href: '/symptoms', icon: Activity, label: 'Report Symptoms', color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950' },
          { href: '/symptoms?voice=true', icon: Mic, label: 'Voice Note', color: 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950' },
          { href: '/upload', icon: Upload, label: 'Upload Report', color: 'text-caution-600 dark:text-caution-400 bg-caution-50 dark:bg-caution-950' },
          { href: '/assistant', icon: Brain, label: 'AI Assistant', color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950' },
          { href: '/timeline', icon: Clock, label: 'Care Timeline', color: 'text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800' },
        ].map(action => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className="card-hover p-4 flex flex-col items-center gap-2 text-center"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Timeline */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Activity</h2>
          <Link href="/timeline" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {timeline.map((event, i) => (
            <div key={event.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                  event.urgencyLevel === 'emergency' ? 'bg-emergency-500' :
                  event.urgencyLevel === 'urgent' ? 'bg-urgent-500' :
                  event.type === 'treatment' ? 'bg-primary-500' :
                  event.type === 'upload' ? 'bg-accent-500' :
                  'bg-surface-300 dark:bg-surface-600'
                }`} />
                {i < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-surface-200 dark:bg-surface-700 my-1" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  {event.urgencyLevel && <UrgencyChip level={event.urgencyLevel} />}
                </div>
                <p className="text-xs text-surface-400 mt-0.5">{event.description}</p>
                <p className="text-2xs text-surface-300 dark:text-surface-600 mt-1">
                  {format(parseISO(event.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medication Reminders */}
      {activeMeds.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Current Medications</h2>
          <div className="space-y-3">
            {activeMeds.map(med => (
              <div key={med.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                <div className="w-10 h-10 rounded-xl bg-caution-50 dark:bg-caution-950 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-caution-600 dark:text-caution-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{med.name}</p>
                  <p className="text-xs text-surface-400">{med.dosage} • {med.frequency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety footer */}
      <div className="text-center py-4">
        <p className="text-xs text-surface-400">
          ⚕️ This tool is for follow-up support and does not replace a doctor&apos;s diagnosis.
        </p>
      </div>
    </div>
  );
}
