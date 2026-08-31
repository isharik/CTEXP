import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import LabFrame from '@/components/LabFrame';
import ResultReveal from '@/components/ResultReveal';
import { resultFromEncoded } from '@/lib/result';
import { isValidUsername, normalizeUsername } from '@/lib/validation';

interface PageProps {
  params: { username: string };
  searchParams: { a?: string };
}

function absoluteUrl(path: string): string {
  const h = headers();
  const host = h.get('host') ?? 'ct-human-experiment.vercel.app';
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}${path}`;
}

export function generateMetadata({ params, searchParams }: PageProps): Metadata {
  const username = normalizeUsername(decodeURIComponent(params.username ?? ''));
  if (!isValidUsername(username)) {
    return { title: 'CT Human Experiment', robots: { index: false } };
  }
  const result = resultFromEncoded(username, searchParams.a);
  const title = result
    ? `@${username} is ${result.personality.title} — CT Human Experiment`
    : `@${username} — CT Human Experiment`;
  const description = result
    ? `${result.personality.title}. Alignment: ${result.alignment}. Run the experiment and get diagnosed.`
    : 'Run the CT Human Experiment and get diagnosed.';
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function ResultPage({ params, searchParams }: PageProps) {
  const username = normalizeUsername(decodeURIComponent(params.username ?? ''));

  if (!isValidUsername(username)) {
    return <NoRun reason="That handle didn't pass validation." />;
  }

  const result = resultFromEncoded(username, searchParams.a);

  if (!result) {
    return (
      <NoRun reason="No completed run found for this link. Results are generated from your answers." />
    );
  }

  const shareUrl = absoluteUrl(
    `/result/${encodeURIComponent(username)}?a=${searchParams.a}`,
  );

  return (
    <LabFrame status="FILE OPEN" code="RESULT">
      <ResultReveal result={result} shareUrl={shareUrl} />
    </LabFrame>
  );
}

function NoRun({ reason }: { reason: string }) {
  return (
    <LabFrame status="NO FILE" code="RESULT">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="lab-label text-signal">● FILE NOT FOUND</span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-bone">
          Nothing on record.
        </h1>
        <p className="mt-3 font-mono text-[12px] leading-relaxed text-faint">
          {reason}
        </p>
        <Link
          href="/"
          className="btn-lab mt-8 border border-bone/80 bg-bone px-6 py-3.5 text-[12px] text-void hover:bg-white"
        >
          START THE EXPERIMENT
        </Link>
      </div>
    </LabFrame>
  );
}
