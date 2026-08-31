import type { ReactNode } from 'react';

interface LabFrameProps {
  /** Right-aligned status label in the top bar. */
  status?: string;
  /** Small code shown top-left after the wordmark. */
  code?: string;
  children: ReactNode;
}

/**
 * The persistent instrument frame: hairline top/bottom bars, corner brackets,
 * a blinking record indicator. Purely presentational, safe on the server.
 */
export default function LabFrame({
  status = 'SESSION ACTIVE',
  code = 'LAB-07',
  children,
}: LabFrameProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Top instrument bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line/70 bg-void/70 px-4 py-2.5 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_10px_rgba(229,72,77,0.8)] animate-blink" />
          <span className="lab-label text-bone/80">CT · HUMAN · EXPERIMENT</span>
          <span className="hidden sm:inline lab-label text-faint">/ {code}</span>
        </div>
        <span className="lab-label text-faint">{status}</span>
      </header>

      {/* Corner brackets */}
      <Corner className="left-3 top-14 border-l border-t" />
      <Corner className="right-3 top-14 border-r border-t" />
      <Corner className="bottom-10 left-3 border-b border-l" />
      <Corner className="bottom-10 right-3 border-b border-r" />

      <main className="relative z-10 flex flex-1 flex-col">{children}</main>

      {/* Bottom instrument bar */}
      <footer className="z-40 flex items-center justify-between border-t border-line/70 px-4 py-2 sm:px-6">
        <span className="lab-label text-faint">SUBJECT OBSERVATION UNIT</span>
        <span className="lab-label text-faint">NO CORRECT ANSWERS</span>
      </footer>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none fixed z-30 hidden h-4 w-4 border-line/60 sm:block ${className}`}
    />
  );
}
