'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart, LayoutDashboard, Activity, Brain, Clock,
  Bell, Settings, LogOut, Sun, Moon, Menu, X, User,
  Stethoscope, Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { demoAlerts } from '@/data/demoData';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const unreadAlerts = demoAlerts.filter(a => !a.isRead).length;

  const patientLinks = [
    { href: '/dashboard/patient', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/symptoms', label: 'Report Symptoms', icon: Activity },
    { href: '/upload', label: 'Upload Reports', icon: Upload },
    { href: '/assistant', label: 'AI Assistant', icon: Brain },
    { href: '/timeline', label: 'Care Timeline', icon: Clock },
    { href: '/alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts },
  ];

  const clinicianLinks = [
    { href: '/dashboard/clinician', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/alerts', label: 'Alerts Queue', icon: Bell, badge: unreadAlerts },
    { href: '/assistant', label: 'AI Assistant', icon: Brain },
    { href: '/timeline', label: 'Patient Timelines', icon: Clock },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings },
    { href: '/dashboard/clinician', label: 'Clinical View', icon: Stethoscope },
    { href: '/alerts', label: 'All Alerts', icon: Bell, badge: unreadAlerts },
  ];

  const links = user.role === 'admin' ? adminLinks :
    user.role === 'clinician' ? clinicianLinks : patientLinks;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)] h-14">
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost !p-2"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">OncoFollow</span>
          </div>
          <Link href="/alerts" className="btn-ghost !p-2 relative">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emergency-500 text-white text-2xs flex items-center justify-center font-bold">
                {unreadAlerts}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">OncoFollow</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost !p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent
              links={links}
              pathname={pathname}
              user={user}
              isDark={isDark}
              toggleTheme={toggle}
              onLogout={handleLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] p-4 flex-col z-30">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">OncoFollow</span>
        </div>
        <SidebarContent
          links={links}
          pathname={pathname}
          user={user}
          isDark={isDark}
          toggleTheme={toggle}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  links,
  pathname,
  user,
  isDark,
  toggleTheme,
  onLogout,
  onNavigate,
}: {
  links: Array<{ href: string; label: string; icon: React.ElementType; badge?: number }>;
  pathname: string;
  user: { name: string; role: string; email: string };
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col flex-1">
      <nav className="space-y-1 flex-1">
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.badge && link.badge > 0 ? (
                <span className="w-5 h-5 rounded-full bg-emergency-500 text-white text-2xs flex items-center justify-center font-bold">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-[var(--card-border)] space-y-1">
        <button onClick={toggleTheme} className="sidebar-link w-full">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={onLogout} className="sidebar-link w-full text-emergency-600 dark:text-emergency-400">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-3 mt-2">
          <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <User className="w-4 h-4 text-surface-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-2xs text-surface-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
