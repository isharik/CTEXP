import { redirect } from 'next/navigation';
import ExperimentRunner from '@/components/ExperimentRunner';
import { isValidUsername, normalizeUsername } from '@/lib/validation';

export const metadata = {
  title: 'Assessment in progress — CT Human Experiment',
  robots: { index: false },
};

export default function ExperimentPage({
  searchParams,
}: {
  searchParams: { u?: string };
}) {
  const raw = searchParams.u ?? '';
  if (!isValidUsername(raw)) {
    redirect('/');
  }
  const username = normalizeUsername(raw);
  return <ExperimentRunner username={username} />;
}
