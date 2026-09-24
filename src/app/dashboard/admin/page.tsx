'use client';
import React, { useState } from 'react';
import {
  Settings, Users, FileText, Database,
  Clock, Search
} from 'lucide-react';
import { demoUsers, demoAuditLogs, demoDocuments } from '@/data/demoData';
import { format, parseISO } from 'date-fns';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'config'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { key: 'users', label: 'Users & Roles', icon: Users },
    { key: 'audit', label: 'Audit Logs', icon: Clock },
    { key: 'config', label: 'System Config', icon: Settings },
  ];

  const filteredUsers = demoUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      patient: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
      clinician: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
      admin: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
      caregiver: 'bg-caution-100 text-caution-700 dark:bg-caution-900 dark:text-caution-300',
    };
    return `text-2xs font-bold px-2 py-0.5 rounded-md uppercase ${colors[role] || ''}`;
  };

  const configItems = [
    { key: 'route_coordinator_sms', value: 'self-report points >= 8 or escalation keyword', category: 'Routing' },
    { key: 'route_emergency_escalation', value: 'emergency keyword list match', category: 'Routing' },
    { key: 'route_human_override', value: 'required on every routed check-in', category: 'Routing' },
    { key: 'assistant_model', value: 'openai/gpt-oss-120b (Groq, free tier)', category: 'Model' },
    { key: 'speech_model', value: 'saaras:v3 (Sarvam AI)', category: 'Model' },
    { key: 'asha_live_model', value: 'gemini-3.8-live, fallback gemini-2.5-flash-native-audio (Gemini free tier)', category: 'Asha' },
    { key: 'asha_voice', value: 'Sulafat (live) · Bulbul v3 kavya (tap to talk)', category: 'Asha' },
    { key: 'asha_max_follow_ups', value: '2 per symptom, never the same question twice', category: 'Asha' },
    { key: 'assistant_temperature', value: '0.3', category: 'Model' },
    { key: 'data_retention_days', value: '365', category: 'Data' },
    { key: 'session_timeout_minutes', value: '60', category: 'Security' },
    { key: 'require_consent', value: 'true', category: 'Security' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Administration</h1>
        <p className="text-sm text-muted mt-1">
          Manage users, review audit logs, and configure system settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-muted uppercase">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoUsers.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-accent-600" />
            <span className="text-xs font-medium text-muted uppercase">Documents</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoDocuments.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-caution-600" />
            <span className="text-xs font-medium text-muted uppercase">Audit Events</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoAuditLogs.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-muted" />
            <span className="text-xs font-medium text-muted uppercase">Model</span>
          </div>
          <p className="text-sm font-semibold text-foreground">GPT-OSS 120B</p>
          <p className="text-2xs text-subtle">Groq · speech by Sarvam AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-plane rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'users' | 'audit' | 'config')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[var(--card-bg)] text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-muted hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3"><span className={roleBadge(user.role)}>{user.role}</span></td>
                    <td className="px-4 py-3 text-xs text-subtle hidden md:table-cell">{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          {demoAuditLogs.map((log, i) => (
            <div key={log.id} className="card p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{log.userName}</span>
                    <span className="text-2xs px-2 py-0.5 rounded-md bg-plane text-muted font-mono">{log.action}</span>
                  </div>
                  <p className="text-xs text-muted">{log.details}</p>
                  <p className="text-2xs text-subtle mt-1 font-mono">{log.resource}</p>
                </div>
                <span className="text-2xs text-subtle flex-shrink-0">
                  {format(parseISO(log.timestamp), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Config */}
      {activeTab === 'config' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Setting</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {configItems.map(item => (
                <tr key={item.key} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--hover-bg)]">
                  <td className="px-4 py-3">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-plane text-muted uppercase">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-mono">{item.key}</td>
                  <td className="px-4 py-3 text-sm text-muted font-mono">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
