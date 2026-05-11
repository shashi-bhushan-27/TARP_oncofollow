'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, User, Stethoscope, Settings, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { demoUsers } from '@/data/demoData';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const suggestedRole = searchParams.get('role');

  const handleLogin = (userId: string) => {
    login(userId);
    const user = demoUsers.find(u => u.id === userId);
    if (user?.role === 'patient') router.push('/dashboard/patient');
    else if (user?.role === 'clinician') router.push('/dashboard/clinician');
    else if (user?.role === 'admin') router.push('/dashboard/admin');
    else if (user?.role === 'caregiver') router.push('/dashboard/patient');
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case 'patient': return <User className="w-5 h-5" />;
      case 'clinician': return <Stethoscope className="w-5 h-5" />;
      case 'admin': return <Settings className="w-5 h-5" />;
      case 'caregiver': return <Users className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300';
      case 'clinician': return 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300';
      case 'admin': return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
      case 'caregiver': return 'bg-caution-50 text-caution-700 dark:bg-caution-950 dark:text-caution-300';
      default: return '';
    }
  };

  const filteredUsers = suggestedRole
    ? demoUsers.filter(u => u.role === suggestedRole)
    : demoUsers;

  const otherUsers = suggestedRole
    ? demoUsers.filter(u => u.role !== suggestedRole)
    : [];

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Sign in to OncoFollow</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
          Select a demo account to explore the platform
        </p>
      </div>

      {/* Demo Accounts */}
      <div className="card p-2 space-y-1">
        {suggestedRole && (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              {suggestedRole === 'patient' ? 'Patient' : 'Clinician'} Accounts
            </p>
          </div>
        )}
        {filteredUsers.map(user => (
          <button
            key={user.id}
            onClick={() => handleLogin(user.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--hover-bg)] transition-colors text-left group"
            id={`login-${user.id}`}
          >
            <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-950 transition-colors">
              {roleIcon(user.role)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-surface-400 truncate">{user.email}</p>
            </div>
            <span className={`text-2xs font-bold px-2 py-1 rounded-md uppercase ${roleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </button>
        ))}

        {otherUsers.length > 0 && (
          <>
            <div className="px-3 py-2 mt-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Other Accounts</p>
            </div>
            {otherUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--hover-bg)] transition-colors text-left group"
                id={`login-${user.id}`}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  {roleIcon(user.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-surface-400 truncate">{user.email}</p>
                </div>
                <span className={`text-2xs font-bold px-2 py-1 rounded-md uppercase ${roleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </button>
            ))}
          </>
        )}
      </div>

      <p className="text-center text-xs text-surface-400 mt-6">
        ⚕️ This is a demo system with simulated patient data.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <p className="text-surface-400">Loading...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
