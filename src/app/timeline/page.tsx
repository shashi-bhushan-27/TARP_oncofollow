'use client';
import React, { useState } from 'react';
import {
  Clock, Activity, FileText, Stethoscope,
  Pill, Calendar, Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { demoTimeline, demoPatients, getPatientForUser } from '@/data/demoData';
import { isPatientSide } from '@/lib/access';
import { format, parseISO } from 'date-fns';
import { TimelineEventType } from '@/types';
import { RoutingChip } from '@/components/RoutingChip';

const typeConfig: Record<TimelineEventType, { icon: React.ElementType; color: string; label: string }> = {
  treatment: { icon: Stethoscope, color: 'bg-primary-500', label: 'Treatment' },
  visit: { icon: Calendar, color: 'bg-accent-500', label: 'Visit' },
  symptom: { icon: Activity, color: 'bg-caution-500', label: 'Symptom Report' },
  upload: { icon: FileText, color: 'bg-accent-500', label: 'Report Upload' },
  ai_alert: { icon: Brain, color: 'bg-urgent-500', label: 'Care-team Alert' },
  clinician_note: { icon: Stethoscope, color: 'bg-primary-500', label: 'Clinician Note' },
  follow_up: { icon: Calendar, color: 'bg-primary-500', label: 'Follow-up' },
  medication: { icon: Pill, color: 'bg-caution-500', label: 'Medication' },
};

export default function TimelinePage() {
  const { user } = useAuth();
  const patientSide = !!user && isPatientSide(user.role);
  // Care teams pick any patient; patients and caregivers only ever see their own record
  const [selectedId, setSelectedId] = useState(demoPatients[0].id);
  const patient = patientSide ? getPatientForUser(user) : demoPatients.find(p => p.id === selectedId);
  const allEvents = demoTimeline.filter(e =>
    patient && e.patientId === patient.id && (!patientSide || !e.careTeamOnly)
  );
  const [filter, setFilter] = useState<TimelineEventType | 'all'>('all');

  const filtered = filter === 'all' ? allEvents : allEvents.filter(e => e.type === filter);

  const filterOptions: Array<{ value: TimelineEventType | 'all'; label: string }> = [
    { value: 'all', label: 'All Events' },
    { value: 'treatment', label: 'Treatments' },
    { value: 'follow_up', label: 'Follow-ups' },
    { value: 'symptom', label: 'Symptoms' },
    { value: 'upload', label: 'Reports' },
    ...(patientSide ? [] : [{ value: 'ai_alert' as const, label: 'Care-team Alerts' }]),
    { value: 'medication', label: 'Medications' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Care timeline</h1>
          <p className="text-sm text-muted mt-1">
            {patient ? `${patient.user.name} — ${filtered.length} events` : `${filtered.length} events`}
          </p>
        </div>
        {!patientSide && (
          <select
            className="input-field text-sm w-auto"
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setFilter('all'); }}
            aria-label="Select patient"
          >
            {demoPatients.map(p => (
              <option key={p.id} value={p.id}>{p.user.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-muted hover:bg-[var(--hover-bg)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {filtered.map((event, i) => {
          const config = typeConfig[event.type] || typeConfig.visit;
          const Icon = config.icon;

          return (
            <div key={event.id} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              {/* Line + Dot */}
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {i < filtered.length - 1 && (
                  <div className="w-px flex-1 bg-surface-200 dark:bg-surface-700 my-1" />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 pb-6">
                <div className="card p-4 transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xs font-bold text-subtle uppercase tracking-wider">{config.label}</span>
                      {event.urgencyLevel && <RoutingChip audience={patientSide ? 'patient' : 'care_team'} priority={event.urgencyLevel} />}
                    </div>
                    <span className="text-xs text-subtle flex-shrink-0">
                      {format(parseISO(event.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{event.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-subtle">No events found for this filter</p>
        </div>
      )}
    </div>
  );
}
