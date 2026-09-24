'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Rocket, Users, Activity, FileText,
  Brain, ShieldAlert, Terminal, Server, Cpu,
  ChevronRight, Sun, Moon, Search, ExternalLink, Mic,
  CheckCircle2, AlertTriangle, HelpCircle, ArrowLeft,
  Copy, Check
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  content: React.ReactNode;
}

export default function DocsPage() {
  const { isDark, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState('deploy');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sections: DocSection[] = [
    {
      id: 'deploy',
      title: 'Deployment Strategy',
      icon: Rocket,
      badge: 'Recommended',
      content: (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-xl bg-[var(--card-bg)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="eyebrow mb-2">Recommended</p>
                <h3 className="font-display text-2xl text-foreground">Deploy on Vercel</h3>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6 max-w-prose">
              Because OncoFollow is built with <strong>Next.js 14 App Router</strong> and leverages server-side API endpoints (`/api/groq`, `/api/transcribe`) that keep AI keys off the browser, deploying on <strong>Vercel</strong> provides zero-configuration CI/CD, automatic HTTPS, and ultra-low latency Edge functions.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 border-t border-[var(--card-border)] pt-6">
              <div className="panel p-4">
                <div className="font-semibold text-sm text-foreground mb-1">Builds on every push</div>
                <div className="text-xs text-subtle">Preview URL for each branch</div>
              </div>
              <div className="panel p-4">
                <div className="font-semibold text-sm text-foreground mb-1">BAA available</div>
                <div className="text-xs text-subtle">On Vercel Pro and Enterprise plans</div>
              </div>
              <div className="panel p-4">
                <div className="font-semibold text-sm text-foreground mb-1">Automatic HTTPS</div>
                <div className="text-xs text-subtle">Served from a global edge network</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Step-by-Step Vercel Deployment
            </h4>
            <ol className="space-y-4 text-sm text-muted">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-foreground">Push codebase to GitHub/GitLab:</strong> Ensure your code is committed to a Git repository. Note that `.env.local` is excluded via `.gitignore` to protect API secrets.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-foreground">Import Project in Vercel Dashboard:</strong> Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-0.5">vercel.com/new <ExternalLink className="w-3 h-3" /></a> and import your OncoFollow repository.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                <div className="w-full">
                  <strong className="text-foreground">Configure Environment Variables:</strong> In the Vercel project configuration screen, add the required environment variables:
                  <div className="mt-2 relative">
                    <pre className="p-3 rounded-xl bg-surface-900 text-surface-100 font-mono text-xs overflow-x-auto">
{`GROQ_API_KEY=your_actual_groq_api_key_here
SARVAM_API_KEY=your_actual_sarvam_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here`}
                    </pre>
                    <button
                      onClick={() => handleCopy('GROQ_API_KEY=your_actual_groq_api_key_here\nSARVAM_API_KEY=your_actual_sarvam_api_key_here\nGEMINI_API_KEY=your_actual_gemini_api_key_here', 1)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors"
                      title="Copy env var"
                    >
                      {copiedIndex === 1 ? <Check className="w-4 h-4 text-primary-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-foreground">Click Deploy:</strong> Vercel will automatically build the Next.js production bundle and assign a secure `.vercel.app` URL.
                </div>
              </li>
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Server className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                Alternative: Docker / Self-Hosted
              </h4>
              <p className="text-xs text-muted mb-4 leading-relaxed">
                For hospital intranets or dedicated cloud VMs (AWS ECS, GCP Cloud Run, Azure App Service), OncoFollow can be containerized.
              </p>
              <div className="relative">
                <pre className="p-3 rounded-xl bg-surface-900 text-surface-100 font-mono text-2xs overflow-x-auto">
{`# Build standalone container
docker build -t oncofollow .
docker run -p 3000:3000 \\
  -e GROQ_API_KEY="your_key" \\
  -e SARVAM_API_KEY="your_key" \\
  -e GEMINI_API_KEY="your_key" \\
  oncofollow`}
                </pre>
                <button
                  onClick={() => handleCopy(`docker build -t oncofollow .\ndocker run -p 3000:3000 -e GROQ_API_KEY="your_key" -e SARVAM_API_KEY="your_key" -e GEMINI_API_KEY="your_key" oncofollow`, 2)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-primary-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-caution-600 dark:text-caution-400" />
                Alternative: Netlify / Cloudflare Pages
              </h4>
              <p className="text-xs text-muted mb-4 leading-relaxed">
                Supports Next.js App Router seamlessly via Netlify Next.js runtime plugin or `@cloudflare/next-on-pages`.
              </p>
              <ul className="text-xs space-y-2 text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                  Ensure Node.js v20+ build environment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                  Add `GROQ_API_KEY`, `SARVAM_API_KEY` and `GEMINI_API_KEY` in Site Settings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                  Build command: `npm run build`
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-caution-200 dark:border-caution-800 bg-caution-50 dark:bg-caution-950/40 flex items-start gap-3 text-xs text-caution-800 dark:text-caution-200">
            <AlertTriangle className="w-5 h-5 text-caution-600 dark:text-caution-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Security & Compliance Note:</strong> When deploying real patient workloads, ensure your host executes a HIPAA Business Associate Agreement (BAA). Encrypt data at rest (database/storage level) and in transit (TLS 1.3).
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'quickstart',
      title: 'Quick Start Guide',
      icon: Rocket,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Getting Started with OncoFollow</h3>
            <p className="text-sm text-muted mb-6">
              OncoFollow is designed to bridge the gap between routine hospital follow-ups for breast cancer survivors. You can explore the platform immediately using our pre-populated clinical demo data.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-plane">
                <span className="chip-routine mb-2">Role 1</span>
                <h4 className="font-bold text-foreground text-base mb-1">For Patients & Survivors</h4>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  Check in by voice in your own language, keep all your reports in one place, prepare for visits and never lose track of a follow-up — with your caregiver alongside you.
                </p>
                <Link href="/login?role=patient" className="btn-primary text-xs px-4 py-2 w-full">
                  Launch Patient Portal <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-plane">
                <span className="chip-soon mb-2">Role 2</span>
                <h4 className="font-bold text-foreground text-base mb-1">For Clinicians & Oncologists</h4>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  Work routed check-in queues, see who is overdue for follow-up, and get a patient-journey summary and visit agenda before each consultation.
                </p>
                <Link href="/login?role=clinician" className="btn-secondary text-xs px-4 py-2 w-full">
                  Launch Clinician Dashboard <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'workflows',
      title: 'User Roles & Navigation',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Core Workflows by Role</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                <div className="flex items-center gap-2 mb-2 font-bold text-primary-600 dark:text-primary-400">
                  <Users className="w-4 h-4" /> Patient Workflow
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  Patients navigate through a streamlined care interface focusing on peace of mind and easy reporting.
                </p>
                <div className="flex flex-wrap gap-2 text-2xs font-semibold text-muted">
                  <span className="px-2.5 py-1 rounded bg-plane">Patient Dashboard</span>
                  <span className="px-2.5 py-1 rounded bg-plane">Report Symptoms</span>
                  <span className="px-2.5 py-1 rounded bg-plane">Upload Scans</span>
                  <span className="px-2.5 py-1 rounded bg-plane">Voice Check-ins</span>
                  <span className="px-2.5 py-1 rounded bg-plane">Care Companion</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                <div className="flex items-center gap-2 mb-2 font-bold text-accent-600 dark:text-accent-400">
                  <Activity className="w-4 h-4" /> Clinician Workflow
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  Care teams work queues of routed check-ins (weekly review, slot this week, coordinator SMS, emergency escalation). Every routing can be overridden, and every action is logged.
                </p>
                <div className="flex flex-wrap gap-2 text-2xs font-semibold text-muted">
                  <span className="px-2.5 py-1 rounded bg-plane">Alerts Queue</span>
                  <span className="px-2.5 py-1 rounded bg-plane">Care Coordination Assistant</span>
                  <span className="px-2.5 py-1 rounded bg-plane">Multi-Patient Timelines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'symptoms',
      title: 'Check-ins & Multilingual Voice',
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Check-ins Routed to the Right Queue</h3>
            <p className="text-sm text-muted mb-6">
              Patients and caregivers tell the care team how things are going between visits. OncoFollow does not assess what they report — it routes the check-in to the right care-team queue and tells the patient what happens next.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="evidence-card">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" /> Guided Selection
                </h4>
                <p className="text-xs text-muted">
                  Patients pick what they are experiencing and say how long, how often and whether it is getting better or worse. Transparent routing rules pick a queue; a care-team member reviews and can change it.
                </p>
              </div>

              <div className="evidence-card">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-accent-600" /> Sarvam AI Voice Notes
                </h4>
                <p className="text-xs text-muted">
                  Patients speak in Hindi, Tamil, Bengali or other Indian languages. Sarvam AI&apos;s speech-to-text-translate model turns the note into English text that the patient can review and edit before sending.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Report Uploads',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">All Reports in One Place</h3>
            <p className="text-sm text-muted mb-4">
              Follow-up care produces dozens of reports from different labs and hospitals. Patients upload them once and the whole care team can find them — no more lost files or forgotten scan CDs.
            </p>
            <ul className="text-xs space-y-3 text-muted pl-2">
              <li className="flex items-start gap-2">
                <span className="citation-badge mt-0.5">Filing</span>
                <span>Each report is filed by type, date, hospital and body region, and placed on the patient&apos;s timeline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="citation-badge mt-0.5">As-is</span>
                <span>Report contents are shared with the care team unchanged. OncoFollow never reads, summarises or interprets results.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'ai',
      title: 'AI Assistants',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Assistive AI, Never Clinical AI</h3>
            <p className="text-sm text-muted mb-4">
              OncoFollow has two assistants, both limited to workflow and engagement tasks. They are instructed never to diagnose, interpret results, suggest tests or treatments, or score risk.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-100">
                <div className="font-bold mb-1">Care Companion (patients &amp; caregivers)</div>
                <p>Visit preparation, appointment reminders, questions to ask the doctor, how family can help, and how to use the app — in the patient&apos;s own language.</p>
              </div>
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-100">
                <div className="font-bold mb-1">Care Coordination (care teams)</div>
                <p>Summarises what the patient reported since the last visit, lists due and overdue follow-ups, and drafts reminder messages. Every draft is reviewed by a person before it is sent.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'safety',
      title: 'Emergency Escalation & Safety',
      icon: ShieldAlert,
      content: (
        <div className="space-y-6">
          <div className="card p-6 border-emergency-300 dark:border-emergency-800 bg-emergency-50/20 dark:bg-emergency-950/10">
            <h3 className="text-xl font-bold text-emergency-800 dark:text-emergency-200 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-emergency-600" />
              Emergency Keyword Escalation
            </h3>
            <p className="text-sm text-muted mb-6">
              If a check-in contains a phrase from a fixed emergency keyword list (e.g., &ldquo;can&apos;t breathe&rdquo;, &ldquo;seizure&rdquo;, &ldquo;coughing blood&rdquo;), OncoFollow skips the normal queues. This is a simple keyword match, not a clinical assessment, and the care team reviews every escalation.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <span className="chip-emergency mb-2">Immediate Action</span>
                <div className="font-bold text-foreground mb-1">Emergency Department Prompt</div>
                <p className="text-muted">Instructs patient to contact emergency services (911/112) immediately.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <span className="chip-urgent mb-2">Care Team</span>
                <div className="font-bold text-foreground mb-1">Urgent On-Call Alert</div>
                <p className="text-muted">Pushes high-priority notification directly to the oncologist&apos;s active dashboard queue.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-canvas border-b border-[var(--card-border)] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patient" className="btn-ghost !p-2 text-muted hover:text-foreground" title="Back to Dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg">OncoFollow Docs</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="btn-ghost !p-2.5 rounded-xl"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          <Link href="/" className="btn-secondary text-xs sm:text-sm">
            Home
          </Link>
          <Link href="/dashboard/patient" className="btn-primary text-xs sm:text-sm">
            Go to App
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-subtle" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field !pl-10 !py-2.5 text-sm"
            />
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {filteredSections.map(sec => {
              const isActive = activeTab === sec.id;
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex-shrink-0 lg:flex-shrink w-auto lg:w-full text-left ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md font-semibold'
                      : 'text-muted hover:bg-[var(--hover-bg)] hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-subtle'}`} />
                    <span>{sec.title}</span>
                  </div>
                  {sec.badge && (
                    <span className={`hidden sm:inline text-2xs px-2 py-0.5 rounded font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:block p-4 rounded-2xl bg-plane border border-[var(--card-border)] text-xs text-muted">
            <p className="font-semibold text-foreground mb-1">Getting ready for a visit?</p>
            <p className="mb-3">The Care Companion helps with visit prep and reminders, 24/7.</p>
            <Link href="/assistant" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1">
              Open Care Companion <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Section Display Area */}
        <main className="lg:col-span-9 space-y-8 animate-fade-in">
          <div className="border-b border-[var(--card-border)] pb-6">
            <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-2">
              <currentSection.icon className="w-5 h-5" />
              <span>OncoFollow Documentation</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-foreground">{currentSection.title}</h1>
          </div>

          <div>{currentSection.content}</div>

          {/* FAQ Accordion at Bottom */}
          <section className="pt-12 border-t border-[var(--card-border)]">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Is my medical data shared with third parties?',
                  a: 'No. All patient data stored in OncoFollow is strictly confidential and protected by clinical-grade encryption. LLM prompts sent to Groq are anonymized and do not store personally identifiable information (PII).',
                },
                {
                  q: 'Does OncoFollow give medical advice?',
                  a: 'No. OncoFollow does not diagnose, interpret reports, recommend tests or treatment, or score clinical risk. It routes check-ins to the right care-team queue, keeps records in one place and helps with visit preparation. Your care team makes every medical decision and can override any automated step.',
                },
                {
                  q: 'Can I use OncoFollow on my mobile phone?',
                  a: 'Yes! OncoFollow is a fully responsive Progressive Web App (PWA). You can report symptoms or record voice notes directly from iOS or Android web browsers.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="card p-5">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">{faq.q}</h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-6 border-t border-[var(--card-border)] bg-plane text-center text-xs text-subtle">
        <p>OncoFollow — cancer follow-up companion v0.1.0 • Built with Next.js 14, Groq and Sarvam AI</p>
      </footer>
    </div>
  );
}
