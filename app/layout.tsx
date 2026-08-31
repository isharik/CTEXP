import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import LiveBackground from '@/components/LiveBackground';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE = 'https://ct-human-experiment.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'CT Human Experiment — What Kind of CT Are You?',
  description:
    '10 questions. One diagnosis. Discover your Crypto Twitter personality.',
  applicationName: 'CT Human Experiment',
  keywords: [
    'crypto twitter',
    'CT personality test',
    'crypto quiz',
    'CT human',
    'web3 personality',
  ],
  openGraph: {
    title: 'CT Human Experiment — What Kind of CT Are You?',
    description:
      '10 questions. One diagnosis. Discover your Crypto Twitter personality.',
    url: SITE,
    siteName: 'CT Human Experiment',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CT Human Experiment',
    description:
      '10 questions. One diagnosis. Discover your Crypto Twitter personality.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#080809',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-void font-display text-bone antialiased">
        <LiveBackground />
        {children}
        <div className="scanband" aria-hidden />
        <div className="scanlines" aria-hidden />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
