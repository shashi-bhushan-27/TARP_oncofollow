'use client';
import React, { useState } from 'react';
import {
  Bell, AlertTriangle, Check, Clock
} from 'lucide-react';

import { demoAlerts } from '@/data/demoData';
import { format, parseISO } from 'date-fns';
import { UrgencyLevel } from '@/types';

function UrgencyChip({ level }: { level: UrgencyLevel }) {
  const classes: Record<string, string> = {
    routine: 'chip-routine', soon: 'chip-soon', urgent: 'chip-urgent', emergency: 'chip-emergency',
  };
  const labels: Record<string, string> = {
    routine: '● Routine', soon: '● Contact Soon', urgent: '● Urgent', emergency: '🚨 Emergency',
  };
  return <span className={classes[level]}>{labels[level]}</span>;
}

export default function AlertsPage() {

  const [filter, setFilter] = useState<UrgencyLevel | 'all'>('all');
  const [alerts, setAlerts] = useState(demoAlerts);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true, status: 'seen' as const } : a));
  };

  const severityColor = (s: UrgencyLevel) => {
    switch (s) {
      case 'emergency': return 'border-l-emergency-500 bg-emergency-50/30 dark:bg-emergency-950/20';
      case 'urgent': return 'border-l-urgent-500 bg-urgent-50/30 dark:bg-urgent-950/20';
      case 'soon': return 'border-l-caution-500 bg-caution-50/30 dark:bg-caution-950/20';
      default: return 'border-l-primary-500';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {filtered.filter(a => !a.isRead).length} unread alerts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'emergency', 'urgent', 'soon', 'routine'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-surface-600 dark:text-surface-400 hover:bg-[var(--hover-bg)]'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map((alert, i) => (
          <div
            key={alert.id}
            className={`card border-l-4 p-4 transition-all animate-fade-in ${severityColor(alert.severity)} ${
              !alert.isRead ? 'shadow-elevated' : 'opacity-80'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                alert.severity === 'emergency' ? 'text-emergency-600' :
                alert.severity === 'urgent' ? 'text-urgent-600' :
                alert.severity === 'soon' ? 'text-caution-600' : 'text-primary-600'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <UrgencyChip level={alert.severity} />
                  <span className="text-2xs text-surface-400">
                    {alert.patientName}
                  </span>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{alert.message}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{alert.details}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xs text-surface-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(alert.createdAt), 'MMM d, h:mm a')}
                  </span>
                  {!alert.isRead && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="text-2xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-400">No alerts found</p>
        </div>
      )}
    </div>
  );
}
