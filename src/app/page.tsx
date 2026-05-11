'use client';
import React from 'react';
import Link from 'next/link';
import {
  Heart, Shield, Mic, FileText, Brain, Bell,
  ChevronRight, Phone, Lock, Activity, Sun, Moon,
  Stethoscope, Users
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function LandingPage() {
  const { isDark, toggle } = useTheme();

  const features = [
    { icon: Activity, title: 'Symptom Check-ins', description: 'Report symptoms through a simple guided flow. Select from common post-treatment symptoms or describe in your own words.' },
    { icon: Mic, title: 'Voice Reporting', description: 'Record voice notes to describe how you feel. We transcribe and analyze your report for follow-up guidance.' },
    { icon: FileText, title: 'Secure Report Uploads', description: 'Upload X-rays, CT scans, blood reports, and other documents. We parse and organize them in your timeline.' },
    { icon: Brain, title: 'Cited AI Guidance', description: 'Get follow-up guidance backed by your own records and trusted oncology guidelines. Every recommendation includes citations.' },
    { icon: Bell, title: 'Doctor Escalation', description: 'Urgent symptoms trigger immediate alerts to your care team. Red flags are detected automatically for your safety.' },
    { icon: Shield, title: 'Safe & Private', description: 'Patient safety first. We never replace your doctor\'s diagnosis. All data is handled with clinical-grade privacy.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">OncoFollow</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="btn-ghost w-10 h-10 !p-0 rounded-xl"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/login" className="btn-secondary text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              Trusted follow-up support for breast cancer survivors
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your follow-up care,{' '}
              <span className="text-primary-600 dark:text-primary-400">guided and safe</span>
            </h1>

            <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Report symptoms, upload test reports, and receive evidence-based guidance — all cited from your own records and trusted oncology guidelines. Never a replacement for your doctor.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/login?role=patient"
                className="btn-primary text-base px-8 py-3.5 gap-2 w-full sm:w-auto"
                id="cta-patient"
              >
                <Users className="w-5 h-5" />
                I am a Patient
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?role=clinician"
                className="btn-secondary text-base px-8 py-3.5 gap-2 w-full sm:w-auto"
                id="cta-clinician"
              >
                <Stethoscope className="w-5 h-5" />
                I am a Clinician
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm text-surface-400 dark:text-surface-500">
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Your data is handled with clinical-grade privacy and security
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-surface-50/50 dark:bg-surface-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Comprehensive follow-up support
              </h2>
              <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
                Everything you need for safe post-treatment monitoring, all in one trusted platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="card-hover p-6 animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                How it works
              </h2>
              <p className="text-surface-500 dark:text-surface-400">
                Simple steps for peace of mind
              </p>
            </div>

            <div className="space-y-8">
              {[
                { step: '1', title: 'Report your symptoms', desc: 'Select from common symptoms or describe in your own words. You can also record a voice note.', icon: Activity },
                { step: '2', title: 'Upload your reports', desc: 'Upload X-rays, blood work, CT scans, or any medical document. We parse and organize them automatically.', icon: FileText },
                { step: '3', title: 'Get cited guidance', desc: 'Receive a safe assessment with citations from your own records and oncology guidelines. See exactly why each recommendation is made.', icon: Brain },
                { step: '4', title: 'Stay connected with your team', desc: 'Your doctor receives alerts for urgent findings. You both stay informed with a shared timeline.', icon: Bell },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-surface-500 dark:text-surface-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Promise  */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-primary-50/50 dark:bg-primary-950/30">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-14 h-14 mx-auto text-primary-600 dark:text-primary-400 mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Our safety promise
            </h2>
            <div className="space-y-4 text-left sm:text-center">
              <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                <strong>OncoFollow never replaces your doctor.</strong> We provide follow-up support — not diagnoses. Every recommendation is grounded in evidence and includes clear citations.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {[
                  'Every recommendation is cited',
                  'Red flags trigger immediate alerts',
                  'All guidance includes safety disclaimers',
                  'Your oncology team stays informed',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="p-6 sm:p-8 rounded-2xl bg-emergency-50 dark:bg-emergency-950/50 border border-emergency-200 dark:border-emergency-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emergency-100 dark:bg-emergency-900 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-emergency-600 dark:text-emergency-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emergency-800 dark:text-emergency-200 mb-1">
                    If you are experiencing a medical emergency
                  </h3>
                  <p className="text-emergency-700 dark:text-emergency-300 text-sm leading-relaxed">
                    Call your local emergency number or go to the nearest emergency department immediately. 
                    This app is for follow-up support only and is not designed for emergency care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 border-t border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">OncoFollow</span>
            </div>
            <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
              ⚕️ This tool is for follow-up support and does not replace a doctor&apos;s diagnosis.
              Always consult your healthcare team for medical decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
