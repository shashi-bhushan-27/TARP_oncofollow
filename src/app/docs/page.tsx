'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Rocket, Users, Activity, FileText,
  Brain, ShieldAlert, Terminal, Server, Cpu,
  ChevronRight, Sun, Moon, Search, ExternalLink, Sparkles,
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
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-elevated">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Best Production Strategy
                </span>
                <h3 className="text-2xl font-bold">Vercel Edge & Serverless Deployment</h3>
              </div>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed mb-6">
              Because OncoFollow is built with <strong>Next.js 14 App Router</strong> and leverages server-side API endpoints (`/api/groq`) for streaming clinical AI guidance, deploying on <strong>Vercel</strong> provides zero-configuration CI/CD, automatic HTTPS, and ultra-low latency Edge functions.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 border-t border-white/20 pt-6">
              <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
                <div className="font-bold text-sm mb-1">⚡ Instant CI/CD</div>
                <div className="text-2xs text-primary-200">Auto-builds on Git push</div>
              </div>
              <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
                <div className="font-bold text-sm mb-1">🛡️ HIPAA Friendly</div>
                <div className="text-2xs text-primary-200">BAA available on Pro plans</div>
              </div>
              <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
                <div className="font-bold text-sm mb-1">🌍 Global Edge CDN</div>
                <div className="text-2xs text-primary-200">Fast static & dynamic assets</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Step-by-Step Vercel Deployment
            </h4>
            <ol className="space-y-4 text-sm text-surface-600 dark:text-surface-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-foreground">Push codebase to GitHub/GitLab:</strong> Ensure your code is committed to a Git repository. Note that `.env.local` is excluded via `.gitignore` to protect API secrets.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-foreground">Import Project in Vercel Dashboard:</strong> Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-0.5">vercel.com/new <ExternalLink className="w-3 h-3" /></a> and import your OncoFollow repository.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                <div className="w-full">
                  <strong className="text-foreground">Configure Environment Variables:</strong> In the Vercel project configuration screen, add the required environment variable:
                  <div className="mt-2 relative">
                    <pre className="p-3 rounded-xl bg-surface-900 text-surface-100 font-mono text-xs overflow-x-auto">
                      GROQ_API_KEY=your_actual_groq_api_key_here
                    </pre>
                    <button
                      onClick={() => handleCopy('GROQ_API_KEY=your_actual_groq_api_key_here', 1)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors"
                      title="Copy env var"
                    >
                      {copiedIndex === 1 ? <Check className="w-4 h-4 text-primary-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</span>
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
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
                For hospital intranets or dedicated cloud VMs (AWS ECS, GCP Cloud Run, Azure App Service), OncoFollow can be containerized.
              </p>
              <div className="relative">
                <pre className="p-3 rounded-xl bg-surface-900 text-surface-100 font-mono text-2xs overflow-x-auto">
{`# Build standalone container
docker build -t oncofollow .
docker run -p 3000:3000 \\
  -e GROQ_API_KEY="your_key" \\
  oncofollow`}
                </pre>
                <button
                  onClick={() => handleCopy(`docker build -t oncofollow .\ndocker run -p 3000:3000 -e GROQ_API_KEY="your_key" oncofollow`, 2)}
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
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
                Supports Next.js App Router seamlessly via Netlify Next.js runtime plugin or `@cloudflare/next-on-pages`.
              </p>
              <ul className="text-xs space-y-2 text-surface-600 dark:text-surface-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                  Ensure Node.js v20+ build environment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                  Add `GROQ_API_KEY` in Site Settings
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
            <p className="text-sm text-surface-600 dark:text-surface-300 mb-6">
              OncoFollow is designed to bridge the gap between routine hospital follow-ups for breast cancer survivors. You can explore the platform immediately using our pre-populated clinical demo data.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-surface-50 dark:bg-surface-800/50">
                <span className="chip-routine mb-2">Role 1</span>
                <h4 className="font-bold text-foreground text-base mb-1">For Patients & Survivors</h4>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
                  Log your daily recovery symptoms, upload your post-treatment lab scans, and receive safe clinical guidance cited directly from oncology guidelines.
                </p>
                <Link href="/login?role=patient" className="btn-primary text-xs px-4 py-2 w-full">
                  Launch Patient Portal <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-surface-50 dark:bg-surface-800/50">
                <span className="chip-soon mb-2">Role 2</span>
                <h4 className="font-bold text-foreground text-base mb-1">For Clinicians & Oncologists</h4>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
                  Review patient alert queues, monitor longitudinal lab trend curves, and investigate AI assessments before clinical consultations.
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
                <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed mb-3">
                  Patients navigate through a streamlined care interface focusing on peace of mind and easy reporting.
                </p>
                <div className="flex flex-wrap gap-2 text-2xs font-semibold text-surface-500">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">📊 Patient Dashboard</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">📝 Report Symptoms</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">📤 Upload Scans</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">🧪 Lab Trends</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">🧠 AI Care Assistant</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                <div className="flex items-center gap-2 mb-2 font-bold text-accent-600 dark:text-accent-400">
                  <Activity className="w-4 h-4" /> Clinician Workflow
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed mb-3">
                  Oncologists receive a prioritized triage queue highlighting patients with red flag symptoms or abnormal biomarker spikes.
                </p>
                <div className="flex flex-wrap gap-2 text-2xs font-semibold text-surface-500">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">🚨 Alerts Queue</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">📈 Critical Patient Labs</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800">⏱️ Multi-Patient Timelines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'symptoms',
      title: 'Symptom Tracking & Voice AI',
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Smart Symptom Check-ins</h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 mb-6">
              Post-treatment side effects (e.g., lymphedema, neuropathy, fatigue, joint pain) are tracked through standard CTCAE oncology criteria.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="evidence-card">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" /> Guided Selection
                </h4>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Patients select severity grades (Mild, Moderate, Severe) for common symptoms. Automated clinical algorithms evaluate if immediate escalation is required.
                </p>
              </div>

              <div className="evidence-card">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent-600" /> Groq Voice Transcription
                </h4>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Using state-of-the-art Groq speech models, survivors can simply speak freely into their microphone. The AI extracts structured clinical entities automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Report Uploads & Lab Curves',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Medical Document Intelligence</h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 mb-4">
              Survivors accumulate dozens of follow-up reports. OncoFollow parses CBC blood counts, tumor markers (CA 15-3, CEA), and radiology summaries into interactive trend charts.
            </p>
            <ul className="text-xs space-y-3 text-surface-600 dark:text-surface-300 pl-2">
              <li className="flex items-start gap-2">
                <span className="citation-badge mt-0.5">PDF</span>
                <span>Automatic OCR and biomarker extraction from laboratory PDF documents.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="citation-badge mt-0.5">Graphs</span>
                <span>Longitudinal Recharts visualization allowing comparison against healthy baseline thresholds.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'ai',
      title: 'Cited AI Assistant (RAG)',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Retrieval-Augmented Clinical AI</h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 mb-4">
              Unlike generic chatbots that hallucinate medical advice, OncoFollow&apos;s AI Assistant is grounded strictly in clinical literature and the patient&apos;s personal timeline.
            </p>
            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-xs text-primary-900 dark:text-primary-100 space-y-2 mb-4">
              <div className="font-bold flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-primary-600 dark:text-primary-400" /> How Citations Work
              </div>
              <p>
                Every response generated by the AI includes inline clickable badges (e.g., <span className="citation-badge">ASCO Guideline 2024</span> or <span className="citation-badge">Lab Scan Oct 12</span>). Clicking a citation reveals the exact source passage.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'safety',
      title: 'Red Flags & Patient Safety',
      icon: ShieldAlert,
      content: (
        <div className="space-y-6">
          <div className="card p-6 border-emergency-300 dark:border-emergency-800 bg-emergency-50/20 dark:bg-emergency-950/10">
            <h3 className="text-xl font-bold text-emergency-800 dark:text-emergency-200 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-emergency-600" />
              Automated Red Flag Escalation
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 mb-6">
              Patient safety is paramount. If a patient logs acute red flag symptoms (e.g., severe shortness of breath, sudden chest pain, neurological deficits, acute swelling), OncoFollow bypasses routine scheduling.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <span className="chip-emergency mb-2">Immediate Action</span>
                <div className="font-bold text-foreground mb-1">Emergency Department Prompt</div>
                <p className="text-surface-500">Instructs patient to contact emergency services (911/112) immediately.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <span className="chip-urgent mb-2">Doctor Triage</span>
                <div className="font-bold text-foreground mb-1">Urgent On-Call Alert</div>
                <p className="text-surface-500">Pushes high-priority notification directly to the oncologist&apos;s active dashboard queue.</p>
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
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patient" className="btn-ghost !p-2 text-surface-500 hover:text-foreground" title="Back to Dashboard">
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
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-surface-400" />
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
                      : 'text-surface-600 dark:text-surface-400 hover:bg-[var(--hover-bg)] hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-surface-400'}`} />
                    <span>{sec.title}</span>
                  </div>
                  {sec.badge && (
                    <span className={`hidden sm:inline text-2xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:block p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/60 border border-[var(--card-border)] text-xs text-surface-500 dark:text-surface-400">
            <p className="font-semibold text-foreground mb-1">Need Clinical Assistance?</p>
            <p className="mb-3">Our AI Assistant is available 24/7 inside the patient dashboard.</p>
            <Link href="/assistant" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1">
              Ask AI Assistant <ChevronRight className="w-3 h-3" />
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
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{currentSection.title}</h1>
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
                  q: 'How accurate are the AI citations?',
                  a: 'The AI Assistant retrieves information directly from uploaded medical reports and curated NCCN/ASCO breast cancer follow-up guidelines. Every claim links to verifiable evidence.',
                },
                {
                  q: 'Can I use OncoFollow on my mobile phone?',
                  a: 'Yes! OncoFollow is a fully responsive Progressive Web App (PWA). You can report symptoms or record voice notes directly from iOS or Android web browsers.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="card p-5">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">{faq.q}</h3>
                  <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-6 border-t border-[var(--card-border)] bg-surface-50 dark:bg-surface-900/40 text-center text-xs text-surface-400">
        <p>OncoFollow Clinical Intelligence System v0.1.0 • Built with Next.js 14 & Groq AI</p>
      </footer>
    </div>
  );
}
