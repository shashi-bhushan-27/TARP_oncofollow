'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { demoUsers, getPatientForUser } from '@/data/demoData';
import { User, UserRole } from '@/types';
import { Wordmark } from '@/components/Wordmark';

const GROUPS: { roles: UserRole[]; heading: string; hint: string }[] = [
  { roles: ['patient'], heading: 'Patients', hint: 'Check in, upload reports and see updates' },
  { roles: ['caregiver'], heading: 'Caregivers', hint: 'Act on behalf of a family member' },
  { roles: ['clinician'], heading: 'Care team', hint: 'Work the alerts queue and prepare visits' },
  { roles: ['admin'], heading: 'Administration', hint: 'Users, audit log and settings' },
];

function initials(name: string) {
  return name.replace(/^Dr\.\s*/, '').split(' ').map(p => p[0]).slice(0, 2).join('');
}

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

  // Put the audience the visitor came for first; patients and caregivers travel together
  const preferred: UserRole[] = suggestedRole === 'patient' ? ['patient', 'caregiver']
    : suggestedRole === 'clinician' ? ['clinician'] : [];
  const ordered = [
    ...GROUPS.filter(g => g.roles.some(r => preferred.includes(r))),
    ...GROUPS.filter(g => !g.roles.some(r => preferred.includes(r))),
  ];

  const describe = (user: User) => {
    if (user.role === 'caregiver') {
      const p = getPatientForUser(user);
      return p ? `Caring for ${p.user.name}` : user.email;
    }
    return user.email;
  };

  return (
    <div className="w-full max-w-lg">
      <Link href="/" className="inline-block mb-10"><Wordmark /></Link>
      <h1 className="page-title">Sign in</h1>
      <p className="text-muted mt-2 mb-8">Choose a demo account. All patient data here is simulated.</p>

      <div className="space-y-8">
        {ordered.map(group => {
          const users = demoUsers.filter(u => group.roles.includes(u.role));
          if (users.length === 0) return null;
          return (
            <section key={group.heading} aria-labelledby={`g-${group.heading}`}>
              <div className="flex items-baseline justify-between mb-2 px-1">
                <h2 id={`g-${group.heading}`} className="eyebrow !font-semibold">{group.heading}</h2>
                <span className="text-xs text-subtle hidden sm:inline">{group.hint}</span>
              </div>
              <ul className="card divide-y divide-[var(--card-border)] overflow-hidden">
                {users.map(user => (
                  <li key={user.id}>
                    <button
                      onClick={() => handleLogin(user.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 min-h-touch text-left hover:bg-[var(--hover-bg)] transition-colors duration-150 group"
                      id={`login-${user.id}`}
                    >
                      <span className="w-9 h-9 rounded-lg bg-plane text-foreground text-sm font-semibold flex items-center justify-center flex-shrink-0">
                        {initials(user.name)}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-foreground truncate">{user.name}</span>
                        <span className="block text-xs text-subtle truncate">{describe(user)}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-subtle group-hover:text-foreground transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas flex justify-center px-4 py-12 sm:py-20">
      <Suspense fallback={
        <div className="w-full max-w-lg space-y-3" aria-label="Loading accounts">
          <div className="skeleton h-8 w-40 mb-10" />
          <div className="skeleton h-9 w-32" />
          <div className="skeleton h-4 w-72 mb-8" />
          {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full" />)}
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
