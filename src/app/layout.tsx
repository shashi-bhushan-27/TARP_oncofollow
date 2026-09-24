import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from '@vercel/analytics/next';

// UI text: Inter. Page and section headings: Source Serif 4.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OncoFollow — Cancer Follow-up Companion",
  description: "Stay connected to your cancer care team between visits. Check in by voice in your own language, keep reports in one place, and never lose track of a follow-up.",
  keywords: ["cancer follow-up", "survivorship", "care coordination", "patient engagement", "caregivers"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
