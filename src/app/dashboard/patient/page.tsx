'use client';
import React from 'react';
import Link from 'next/link';
import { Activity, Mic, Upload, ArrowRight, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  demoSymptomReports, demoDocuments, demoTimeline,
  getPatientForUser, getNotificationsForPatient
} from '@/data/demoData';
import { format, differenceInDays, parseISO } from 'date-fns';
import { RoutingChip } from '@/components/RoutingChip';

export default function PatientDashboard() {
  const { user } = useAuth();
  const patient = getPatientForUser(user);
  if (!user || !patient) return null;
  const isCaregiver = user.role === 'caregiver';
  const firstName = patient.user.name.split(' ')[0];

  const recentReports = demoSymptomReports.filter(r => r.patientId === patient.id);
  const documents = demoDocuments.filter(d => d.patientId === patient.id);
  const allNotifications = getNotificationsForPatient(patient.id);
  const unreadCount = allNotifications.filter(n => !n.isRead).length;
  const timeline = demoTimeline
    .filter(t => t.patientId === patient.id && !t.careTeamOnly)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const nextFollowUp = patient.followUpSchedule.find(f => f.status === 'scheduled');
  const daysUntilFollowUp = nextFollowUp ? differenceInDays(parseISO(nextFollowUp.dueDate), new Date()) : null;
  const followUpPassed = daysUntilFollowUp !== null && daysUntilFollowUp < 0;

  const activeMeds = patient.medications.filter(m => m.isActive);
  const lastSymptomReport = recentReports[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <header>
        <p className="eyebrow mb-2">{format(new Date(), 'EEEE, d MMMM')}</p>
        <h1 className="page-title">Good to see you, {user.name.split(' ')[0]}</h1>
        <p className="text-muted mt-1">
          {isCaregiver
            ? `You are caring for ${patient.user.name} · ${patient.treatmentCenter}`
            : `${patient.treatmentCenter} · Follow-up ${patient.followUpFrequency.toLowerCase()}`}
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Next step */}
        <section className="card lg:col-span-2" aria-labelledby="next-visit">
          <div className="p-6 sm:p-8">
            <p className="eyebrow mb-3" id="next-visit">Next follow-up visit</p>
            {nextFollowUp ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <p className="font-display text-3xl text-foreground">
                    {format(parseISO(nextFollowUp.dueDate), 'd MMMM yyyy')}
                  </p>
                  {followUpPassed ? (
                    <span className="chip-soon">Date has passed</span>
                  ) : (
                    <span className="chip-routine">In {daysUntilFollowUp} days</span>
                  )}
                </div>
                <p className="text-muted mt-2">{nextFollowUp.type} · {patient.treatmentCenter}</p>
                <p className="text-foreground mt-4 max-w-prose">
                  {followUpPassed
                    ? `This visit date has passed. Please call ${patient.treatmentCenter} to choose a new date.`
                    : 'Bring your medicine list, any new reports and your questions for the doctor.'}
                </p>
                <Link
                  href="/assistant"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-700 dark:text-primary-300 hover:underline underline-offset-4"
                >
                  Get ready for this visit with the care companion <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <p className="text-muted">No visit is scheduled yet. Your care team will add your next one.</p>
            )}
          </div>

          <div className="divider" />

          <div className="p-6 sm:px-8">
            <p className="font-medium text-foreground">
              {isCaregiver ? `How is ${firstName} doing?` : 'How are you doing?'}
            </p>
            <p className="text-sm text-muted mt-0.5 mb-4">
              {isCaregiver
                ? `Tell ${firstName}'s care team between visits. It takes about a minute.`
                : 'Tell your care team between visits. It takes about a minute.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/symptoms" className="btn-primary">
                <Activity className="w-4 h-4" /> Start check-in
              </Link>
              <Link href="/symptoms?voice=true" className="btn-secondary">
                <Mic className="w-4 h-4" /> Record a voice note
              </Link>
              <Link href="/upload" className="btn-secondary">
                <Upload className="w-4 h-4" /> Upload a report
              </Link>
            </div>
          </div>
        </section>

        {/* From the care team */}
        <section className="panel p-6 flex flex-col" aria-labelledby="from-team">
          <div className="flex items-baseline justify-between mb-4">
            <h2 id="from-team" className="section-title !font-sans">From your care team</h2>
            {unreadCount > 0 && <span className="text-xs text-subtle">{unreadCount} new</span>}
          </div>
          {allNotifications.length === 0 ? (
            <p className="text-sm text-muted">Nothing new from your care team.</p>
          ) : (
            <ul className="space-y-4 flex-1">
              {allNotifications.slice(0, 3).map(n => (
                <li key={n.id}>
                  <Link href="/notifications" className="group block">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary-600 dark:bg-primary-300'}`}
                        aria-label={n.isRead ? undefined : 'Unread'}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm group-hover:underline underline-offset-4 ${n.isRead ? 'text-muted' : 'text-foreground font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-subtle mt-0.5">{format(parseISO(n.createdAt), 'd MMM')}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/notifications" className="mt-6 text-sm font-medium text-primary-700 dark:text-primary-300 hover:underline underline-offset-4">
            All notifications
          </Link>
        </section>
      </div>

      {/* At a glance */}
      <section className="card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--card-border)]" aria-label="At a glance">
        <div className="p-5">
          <p className="eyebrow mb-2">Last check-in</p>
          {lastSymptomReport ? (
            <>
              <RoutingChip audience="patient" priority={lastSymptomReport.triageResult?.routingPriority || 'routine'} />
              <p className="text-xs text-subtle mt-2">{format(parseISO(lastSymptomReport.createdAt), 'd MMM yyyy')}</p>
            </>
          ) : (
            <Link href="/symptoms" className="text-sm text-primary-700 dark:text-primary-300 hover:underline underline-offset-4">
              No check-ins yet — start one
            </Link>
          )}
        </div>
        <div className="p-5">
          <p className="eyebrow mb-2">Reports on file</p>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{documents.length}</p>
          <Link href="/upload" className="text-xs text-primary-700 dark:text-primary-300 hover:underline underline-offset-4">Upload another</Link>
        </div>
        <div className="p-5">
          <p className="eyebrow mb-2">Current medicines</p>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{activeMeds.length}</p>
          <p className="text-xs text-subtle">As prescribed by your doctor</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <section className="card lg:col-span-2 p-6" aria-labelledby="recent">
          <div className="flex items-baseline justify-between mb-4">
            <h2 id="recent" className="section-title !font-sans">Recent activity</h2>
            <Link href="/timeline" className="text-sm font-medium text-primary-700 dark:text-primary-300 hover:underline underline-offset-4">
              Full timeline
            </Link>
          </div>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted">Your check-ins, reports and visits will appear here.</p>
          ) : (
            <ol className="divide-y divide-[var(--card-border)]">
              {timeline.map(event => (
                <li key={event.id} className="py-3 first:pt-0 last:pb-0 grid grid-cols-[5.5rem_1fr] gap-4">
                  <time className="text-xs text-subtle pt-0.5 tabular-nums" dateTime={event.date}>
                    {format(parseISO(event.date), 'd MMM yyyy')}
                  </time>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      {event.urgencyLevel && <RoutingChip audience="patient" priority={event.urgencyLevel} />}
                    </div>
                    <p className="text-sm text-muted mt-0.5">{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Medicines */}
        <section className="card p-6" aria-labelledby="meds">
          <h2 id="meds" className="section-title !font-sans mb-4">Medicines</h2>
          {activeMeds.length === 0 ? (
            <p className="text-sm text-muted">No current medicines recorded.</p>
          ) : (
            <ul className="divide-y divide-[var(--card-border)]">
              {activeMeds.map(med => (
                <li key={med.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{med.name} <span className="text-muted font-normal">{med.dosage}</span></p>
                  <p className="text-xs text-subtle mt-0.5">{med.frequency}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/assistant" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 hover:underline underline-offset-4">
            <MessageSquareText className="w-4 h-4" /> Questions about your routine?
          </Link>
        </section>
      </div>

      <p className="text-xs text-subtle">
        OncoFollow supports your follow-up care and does not replace your doctor. For an emergency, call your local emergency number.
      </p>
    </div>
  );
}
