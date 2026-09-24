'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Calendar, CheckCircle, FileText, Pill, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPatientForUser, getNotificationsForPatient } from '@/data/demoData';
import { PatientNotificationKind } from '@/types';
import { format, parseISO } from 'date-fns';

const KIND_CONFIG: Record<PatientNotificationKind, { icon: React.ElementType; color: string }> = {
  check_in: { icon: CheckCircle, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950' },
  appointment: { icon: Calendar, color: 'text-caution-600 dark:text-caution-400 bg-caution-50 dark:bg-caution-950' },
  report: { icon: FileText, color: 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950' },
  reminder: { icon: Pill, color: 'text-muted bg-plane' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const patient = getPatientForUser(user);
  const [notifications, setNotifications] = useState(() => (patient ? getNotificationsForPatient(patient.id) : []));

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Notifications</h1>
        <p className="text-sm text-muted mt-1">
          {user?.role === 'caregiver' && patient ? `Updates about ${patient.user.name}'s care` : 'Updates about your care'}
          {' • '}{unread} unread
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="card p-8 text-center">
          <Bell className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-subtle">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const { icon: Icon, color } = KIND_CONFIG[n.kind];
            return (
              <div
                key={n.id}
                className={`card p-5 animate-fade-in ${n.isRead ? 'opacity-75' : 'border-l-4 border-l-primary-500'}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground text-sm">{n.title}</p>
                      <span className="text-2xs text-subtle whitespace-nowrap">{format(parseISO(n.createdAt), 'MMM d')}</span>
                    </div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{n.body}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {n.actionHref && (
                        <Link href={n.actionHref} className="text-xs text-primary-600 dark:text-primary-400 font-medium inline-flex items-center gap-1 hover:underline">
                          {n.actionLabel} <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {!n.isRead && (
                        <button onClick={() => markRead(n.id)} className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
