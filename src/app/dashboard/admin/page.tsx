'use client';
import React, { useState } from 'react';
import {
  Settings, Users, FileText, Database,
  Clock, Search
} from 'lucide-react';
import { demoUsers, demoGuidelines, demoAuditLogs } from '@/data/demoData';
import { format, parseISO } from 'date-fns';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'guidelines' | 'config'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { key: 'users', label: 'Users & Roles', icon: Users },
    { key: 'audit', label: 'Audit Logs', icon: Clock },
    { key: 'guidelines', label: 'Knowledge Base', icon: FileText },
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
    { key: 'alert_threshold_urgent', value: 'score >= 7', category: 'Triage' },
    { key: 'alert_threshold_emergency', value: 'any red flag', category: 'Triage' },
    { key: 'rag_top_k', value: '5', category: 'Retrieval' },
    { key: 'rag_similarity_threshold', value: '0.75', category: 'Retrieval' },
    { key: 'llm_model', value: 'gpt-4-turbo (mock)', category: 'Model' },
    { key: 'llm_temperature', value: '0.2', category: 'Model' },
    { key: 'llm_max_tokens', value: '1500', category: 'Model' },
    { key: 'data_retention_days', value: '365', category: 'Data' },
    { key: 'session_timeout_minutes', value: '60', category: 'Security' },
    { key: 'require_consent', value: 'true', category: 'Security' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Manage users, review audit logs, and configure system settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoUsers.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-accent-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Guidelines</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoGuidelines.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-caution-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Audit Events</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{demoAuditLogs.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-surface-600" />
            <span className="text-xs font-medium text-surface-500 uppercase">Model</span>
          </div>
          <p className="text-sm font-bold text-foreground">Mock LLM</p>
          <p className="text-2xs text-surface-400">No API key configured</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'users' | 'audit' | 'guidelines' | 'config')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[var(--card-bg)] shadow-card text-foreground'
                : 'text-surface-500 hover:text-foreground'
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
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
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-500 hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3"><span className={roleBadge(user.role)}>{user.role}</span></td>
                    <td className="px-4 py-3 text-xs text-surface-400 hidden md:table-cell">{user.createdAt}</td>
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
                    <span className="text-2xs px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 font-mono">{log.action}</span>
                  </div>
                  <p className="text-xs text-surface-500">{log.details}</p>
                  <p className="text-2xs text-surface-400 mt-1 font-mono">{log.resource}</p>
                </div>
                <span className="text-2xs text-surface-400 flex-shrink-0">
                  {format(parseISO(log.timestamp), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Knowledge Base */}
      {activeTab === 'guidelines' && (
        <div className="space-y-3">
          {demoGuidelines.map((guide, i) => (
            <div key={guide.id} className="card p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{guide.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium">{guide.category}</span>
                    <span className="text-2xs text-surface-400">v{guide.version}</span>
                    <span className="text-2xs text-surface-400">• {guide.source}</span>
                  </div>
                </div>
              </div>
              <pre className="text-xs text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 p-3 rounded-lg mt-3 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                {guide.content.substring(0, 500)}{guide.content.length > 500 ? '...' : ''}
              </pre>
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
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Setting</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {configItems.map(item => (
                <tr key={item.key} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--hover-bg)]">
                  <td className="px-4 py-3">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 uppercase">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-mono">{item.key}</td>
                  <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400 font-mono">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
