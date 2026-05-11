import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "OncoFollow — Breast Cancer Follow-up Support",
  description: "A trusted follow-up support system for breast cancer survivors. Report symptoms, upload follow-up reports, and receive safe, cited clinical guidance — all in one place.",
  keywords: ["breast cancer", "follow-up", "symptom tracking", "oncology", "survivorship", "clinical decision support"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
