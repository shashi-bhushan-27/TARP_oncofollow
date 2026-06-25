import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation & User Guide — OncoFollow',
  description: 'Comprehensive user manual, workflow guide, and clinical safety documentation for OncoFollow.',
  keywords: ['OncoFollow docs', 'user guide', 'breast cancer follow-up', 'oncology AI documentation', 'clinical decision support'],
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
