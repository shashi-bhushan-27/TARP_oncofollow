'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Activity, MessageSquareText, Clock,
  Bell, Settings, LogOut, Sun, Moon, Menu, X,
  Stethoscope, Upload, BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { demoAlerts, getPatientForUser, getNotificationsForPatient } from '@/data/demoData';
import { ROLE_HOME, canAccess, isPatientSide } from '@/lib/access';
import { Wordmark } from '@/components/Wordmark';

type NavLink = { href: string; label: string; icon: React.ElementType; badge?: number };
type NavGroup = { heading?: string; links: NavLink[] };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, ready } = useAuth();
  const { isDark, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const allowed = !!user && canAccess(user.role, pathname);

  // Send anyone who opens another role's screen back to their own home
  useEffect(() => {
    if (user && !allowed) router.replace(ROLE_HOME[user.role]);
  }, [user, allowed, router]);

  // Wait for the saved session before deciding the person isn't signed in
  if (!ready) return null;
  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }
  if (!allowed) return null;

  const patientSide = isPatientSide(user.role);
  const myPatient = patientSide ? getPatientForUser(user) : undefined;
  // Patients see their own notifications; care teams see the internal alert queue
  const unreadAlerts = patientSide
    ? (myPatient ? getNotificationsForPatient(myPatient.id).filter(n => !n.isRead).length : 0)
    : demoAlerts.filter(a => !a.isRead).length;
  const bellHref = patientSide ? '/notifications' : '/alerts';
  const roleLabel = user.role === 'caregiver' && myPatient ? `Caregiver for ${myPatient.user.name}` : user.role;

  const patientNav: NavGroup[] = [
    {
      links: [
        { href: '/dashboard/patient', label: 'Overview', icon: LayoutDashboard },
        { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadAlerts },
      ],
    },
    {
      heading: 'Your care',
      links: [
        { href: '/symptoms', label: 'Check in', icon: Activity },
        { href: '/upload', label: 'Upload a report', icon: Upload },
        { href: '/timeline', label: 'Care timeline', icon: Clock },
      ],
    },
    {
      heading: 'Help',
      links: [
        { href: '/assistant', label: 'Care companion', icon: MessageSquareText },
        { href: '/docs', label: 'Guide', icon: BookOpen },
      ],
    },
  ];

  const clinicianNav: NavGroup[] = [
    {
      links: [
        { href: '/dashboard/clinician', label: 'Overview', icon: LayoutDashboard },
        { href: '/alerts', label: 'Alerts queue', icon: Bell, badge: unreadAlerts },
      ],
    },
    {
      heading: 'Patients',
      links: [
        { href: '/timeline', label: 'Patient timelines', icon: Clock },
        { href: '/assistant', label: 'Coordination assistant', icon: MessageSquareText },
      ],
    },
    { heading: 'Help', links: [{ href: '/docs', label: 'Guide', icon: BookOpen }] },
  ];

  const adminNav: NavGroup[] = [
    {
      links: [
        { href: '/dashboard/admin', label: 'Administration', icon: Settings },
        { href: '/dashboard/clinician', label: 'Clinical view', icon: Stethoscope },
        { href: '/alerts', label: 'All alerts', icon: Bell, badge: unreadAlerts },
      ],
    },
    { heading: 'Help', links: [{ href: '/docs', label: 'Guide', icon: BookOpen }] },
  ];

  const nav = user.role === 'admin' ? adminNav :
    user.role === 'clinician' ? clinicianNav : patientNav;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sidebarProps = {
    nav,
    pathname,
    user,
    roleLabel,
    isDark,
    toggleTheme: toggle,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 w-full z-40 bg-canvas border-b border-[var(--card-border)] h-14">
        <div className="flex items-center justify-between px-2 h-full">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost !px-3" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <Wordmark size="sm" />
          <Link href={bellHref} className="btn-ghost !px-3 relative" aria-label={`${unreadAlerts} unread`}>
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute top-2 right-2 min-w-[1rem] h-4 px-1 rounded bg-primary-600 text-white text-2xs font-semibold flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[var(--modal-overlay)]" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--sidebar-bg)] p-4 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between mb-6 px-1">
              <Wordmark size="sm" />
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost !px-3" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent {...sidebarProps} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--sidebar-bg)] px-4 py-6 flex-col z-30">
        <div className="px-2 mb-8">
          <Wordmark subtitle="Cancer follow-up companion" />
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="px-4 py-6 sm:px-8 lg:px-12 lg:py-10 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  nav,
  pathname,
  user,
  roleLabel,
  isDark,
  toggleTheme,
  onLogout,
  onNavigate,
}: {
  nav: NavGroup[];
  pathname: string;
  user: { name: string; role: string; email: string };
  roleLabel: string;
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const initials = user.name.replace(/^Dr\.\s*/, '').split(' ').map(p => p[0]).slice(0, 2).join('');

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.heading && <p className="eyebrow px-3 mb-2">{group.heading}</p>}
            <div className="space-y-0.5">
              {group.links.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                  >
                    <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-300' : ''}`} />
                    <span className="flex-1">{link.label}</span>
                    {link.badge && link.badge > 0 ? (
                      <span className="min-w-[1.25rem] h-5 px-1.5 rounded bg-primary-600 text-white text-2xs font-semibold flex items-center justify-center">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-[var(--plane-strong)]">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="w-9 h-9 rounded-lg bg-[var(--card-bg)] text-foreground text-sm font-semibold flex items-center justify-center flex-shrink-0">
            {initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-subtle capitalize truncate">{roleLabel}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          <button onClick={toggleTheme} className="sidebar-link flex-1 !text-sm" aria-label="Toggle colour theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={onLogout} className="sidebar-link flex-1 !text-sm">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
