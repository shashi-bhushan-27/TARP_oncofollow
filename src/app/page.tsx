'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Sun, Moon, Mic, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Wordmark } from '@/components/Wordmark';
import { RoutingChip } from '@/components/RoutingChip';
import {
  RoutingPriority, PATIENT_ROUTING_STATUS, ROUTING_PRIORITY_ACTIONS
} from '@/types';

const QUEUES: RoutingPriority[] = ['routine', 'soon', 'urgent', 'emergency'];

export default function LandingPage() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      {/* Header */}
      <header className="border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Wordmark />
          <nav className="flex items-center gap-1">
            <Link href="/docs" className="btn-ghost hidden sm:inline-flex">Guide</Link>
            <button onClick={toggle} className="btn-ghost !px-3" aria-label="Toggle colour theme">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/login" className="btn-secondary ml-1">Sign in</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <p className="eyebrow mb-5">For people in cancer follow-up care, their families and their care teams</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground">
              Stay close to your care team between visits.
            </h1>
            <p className="text-lg text-muted mt-6 max-w-xl">
              Follow-up after cancer treatment lasts years. OncoFollow keeps patients and caregivers in touch with their team:
              check in by voice in your own language, keep every report in one place, and always know what happens next.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link href="/login?role=patient" className="btn-primary !px-5 !min-h-[48px]" id="cta-patient">
                I am a patient or caregiver <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login?role=clinician" className="btn-secondary !px-5 !min-h-[48px]" id="cta-clinician">
                I work on a care team
              </Link>
            </div>
            <p className="text-sm text-subtle mt-6">Demo system with simulated patient data.</p>
          </div>

          {/* A real screen: what a patient sees after checking in */}
          <figure className="card p-6 sm:p-7" aria-label="Example of a check-in result">
            <div className="flex items-center justify-between mb-5">
              <p className="eyebrow">Check-in sent · 28 March</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
                <Mic className="w-3.5 h-3.5" /> Spoken in Hindi · shown in English
              </span>
            </div>
            <blockquote className="font-display text-xl text-foreground leading-snug">
              &ldquo;I have had a dry cough for three weeks and it is getting worse. I feel more tired than usual.&rdquo;
            </blockquote>
            <div className="mt-6 pt-5 border-t border-[var(--card-border)]">
              <p className="text-xs text-subtle mb-2">Routed to</p>
              <RoutingChip priority="urgent" audience="patient" />
              <p className="text-sm text-muted mt-3">
                The on-call coordinator has your update and will call you back today.
              </p>
            </div>
            <div className="mt-5 panel p-4">
              <p className="text-sm font-medium text-foreground mb-2">Before your visit</p>
              <ul className="space-y-1.5">
                {[
                  'Ask your caregiver to come with you',
                  'Bring your scan CDs and printed reports',
                  'Bring your medicine list and hospital ID',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-primary-600 dark:text-primary-300 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </figure>
        </section>

        {/* How a check-in is routed */}
        <section className="bg-[var(--card-bg)] border-y border-[var(--card-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
            <div className="max-w-2xl mb-10">
              <h2 className="font-display text-3xl text-foreground">Every check-in lands in the right queue</h2>
              <p className="text-muted mt-3">
                Clear, written rules decide where a check-in goes. The patient sees what it means for them, and the care team sees
                what to do. A person reviews every one and can move it.
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th scope="col" className="eyebrow font-semibold py-3 pr-6 pl-4 sm:pl-0 w-[22%]">Queue</th>
                    <th scope="col" className="eyebrow font-semibold py-3 pr-6 w-[34%]">What the patient sees</th>
                    <th scope="col" className="eyebrow font-semibold py-3 pr-4 sm:pr-0">What the care team does</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {QUEUES.map(q => (
                    <tr key={q} className="align-top">
                      <td className="py-4 pr-6 pl-4 sm:pl-0"><RoutingChip priority={q} /></td>
                      <td className="py-4 pr-6 text-sm text-foreground">{PATIENT_ROUTING_STATUS[q]}</td>
                      <td className="py-4 pr-4 sm:pr-0 text-sm text-muted">{ROUTING_PRIORITY_ACTIONS[q]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Two audiences */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20 grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h2 className="font-display text-2xl text-foreground mb-6">For patients and caregivers</h2>
            <dl className="space-y-5">
              {[
                ['Check in any time', 'Pick what you have noticed, or record a voice note in Hindi, Tamil, Bengali or another Indian language.'],
                ['Know what happens next', 'See where your check-in went and how to get ready for your visit.'],
                ['Keep reports together', 'Upload scans and blood reports once. Your whole care team can find them.'],
                ['Bring your family in', 'A caregiver can check in and follow updates on your behalf.'],
              ].map(([term, desc]) => (
                <div key={term}>
                  <dt className="font-medium text-foreground">{term}</dt>
                  <dd className="text-muted mt-1">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground mb-6">For care teams</h2>
            <dl className="space-y-5">
              {[
                ['One queue, already sorted', 'Check-ins arrive routed, with the patient’s own words and the reports they sent.'],
                ['Catch missed visits', 'Overdue follow-ups appear in the alerts queue so no one quietly drops out.'],
                ['Walk into the visit prepared', 'The coordination assistant summarises what the patient reported since last time.'],
                ['Stay in charge', 'Override any routing. Every action is recorded in the audit log.'],
              ].map(([term, desc]) => (
                <div key={term}>
                  <dt className="font-medium text-foreground">{term}</dt>
                  <dd className="text-muted mt-1">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Boundaries */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
          <div className="panel p-8 sm:p-10 grid md:grid-cols-[1fr_1.4fr] gap-8">
            <div>
              <h2 className="font-display text-2xl text-foreground">What OncoFollow will not do</h2>
              <p className="text-muted mt-3">
                It supports the work around your care. Every medical decision stays with your doctors.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 content-start">
              {[
                'Diagnose or guess what a symptom means',
                'Read or interpret your test results',
                'Suggest tests, scans or treatments',
                'Score your risk',
                'Tell you a symptom is nothing to worry about',
                'Act without a person able to override it',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <span className="mt-2.5 w-3 h-px bg-current flex-shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Emergency notice */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-start gap-4 border-l-4 border-emergency-600 pl-5 py-1">
            <Phone className="w-5 h-5 text-emergency-700 dark:text-emergency-300 mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-sans text-base font-semibold text-foreground">In an emergency, do not use this app</h2>
              <p className="text-muted mt-1">
                Call your local emergency number or go to the nearest emergency department.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <Wordmark size="sm" />
          <p className="text-xs text-subtle max-w-md">
            OncoFollow supports follow-up care and does not replace your doctor. Always follow your care team&apos;s advice.
          </p>
          <Link href="/docs" className="text-sm font-medium text-primary-700 dark:text-primary-300 hover:underline underline-offset-4">
            Read the guide
          </Link>
        </div>
      </footer>
    </div>
  );
}
