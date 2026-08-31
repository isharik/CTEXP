import Link from 'next/link';
import LabFrame from '@/components/LabFrame';

export default function NotFound() {
  return (
    <LabFrame status="OFF THE MAP" code="404">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="numeral font-display text-7xl font-bold text-line">404</span>
        <span className="lab-label mt-4 text-signal">● UNCHARTED SECTOR</span>
        <p className="mt-3 font-mono text-[12px] leading-relaxed text-faint">
          This page is not part of the study.
        </p>
        <Link
          href="/"
          className="btn-lab mt-8 border border-bone/80 bg-bone px-6 py-3.5 text-[12px] text-void hover:bg-white"
        >
          RETURN TO INTAKE
        </Link>
      </div>
    </LabFrame>
  );
}
