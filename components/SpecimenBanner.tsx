/**
 * Specimen Banner — the landing masthead. A horizontal lab instrument: an
 * oscilloscope reading the (as-yet-unknown) subject, with a heartbeat pulse
 * sweeping continuously across it. Fresh take on the old circular ring; wide,
 * short, and unmistakably "you are being measured". CSS/SVG only.
 */

const BASE = 70;
const BEAT = 240;
const TOTAL = 720;

function ecgPath(): string {
  let d = `M0 ${BASE}`;
  for (let x = 0; x < TOTAL; x += BEAT) {
    d += ` L${x + 90} ${BASE}`;
    d += ` L${x + 99} ${BASE - 9} L${x + 108} ${BASE}`; // P wave
    d += ` L${x + 120} ${BASE}`;
    d += ` L${x + 126} ${BASE + 8} L${x + 132} ${BASE - 42} L${x + 140} ${BASE + 38} L${x + 147} ${BASE - 4} L${x + 154} ${BASE}`; // QRS
    d += ` L${x + 172} ${BASE - 12} L${x + 190} ${BASE}`; // T wave
    d += ` L${x + BEAT} ${BASE}`;
  }
  return d;
}

export default function SpecimenBanner() {
  const d = ecgPath();
  const gridLines = Array.from({ length: TOTAL / 60 - 1 }, (_, i) => (i + 1) * 60);

  return (
    <div className="group relative w-full overflow-hidden border border-line bg-gradient-to-r from-panel via-ink to-panel transition-[box-shadow,border-color] duration-300 ease-out hover:border-signal/35 hover:shadow-[0_0_46px_-6px_rgba(229,72,77,0.24)]">
      {/* corner ticks */}
      <Tick className="left-0 top-0 border-l border-t" />
      <Tick className="right-0 top-0 border-r border-t" />
      <Tick className="bottom-0 left-0 border-b border-l" />
      <Tick className="bottom-0 right-0 border-b border-r" />

      {/* top instrument bar */}
      <div className="flex items-center justify-between border-b border-line/70 px-4 py-2 sm:px-5">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_rgba(229,72,77,0.9)] animate-blink" />
          <span className="lab-label text-ash">LIVE SPECIMEN FEED</span>
        </span>
        <span className="lab-label text-faint">CH·01 / GAIN 4.7 / 60Hz</span>
      </div>

      {/* body: identity + oscilloscope */}
      <div className="flex items-stretch">
        <div className="flex min-w-[36%] flex-col justify-center gap-1 border-r border-line/60 px-5 py-6 sm:min-w-[34%]">
          <span className="lab-label text-faint">SPECIMEN</span>
          <span className="font-mono text-3xl font-medium leading-none tracking-tight text-bone sm:text-4xl">
            UNKNOWN
          </span>
          <span className="mt-1 lab-label text-ash">ID PENDING</span>
        </div>

        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${TOTAL} 140`}
            preserveAspectRatio="none"
            className="h-24 w-full sm:h-28"
          >
            <defs>
              <filter id="pulseGlow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* faint scope grid */}
            {gridLines.map((x) => (
              <line key={x} x1={x} y1="8" x2={x} y2="132" stroke="#1c1c20" strokeWidth="0.6" />
            ))}
            <line x1="0" y1={BASE} x2={TOTAL} y2={BASE} stroke="#1c1c20" strokeWidth="0.6" />

            {/* ghost trace */}
            <path d={d} fill="none" stroke="rgba(233,233,228,0.14)" strokeWidth="1" />

            {/* sweeping comet tail */}
            <path
              d={d}
              pathLength={1000}
              fill="none"
              stroke="#e5484d"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="46 954"
              filter="url(#pulseGlow)"
              className="animate-sweep"
            />

            {/* glowing head */}
            <circle r="3.6" fill="#ff9a9d" filter="url(#pulseGlow)">
              <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto" path={d} />
            </circle>
          </svg>

          <span className="lab-label absolute right-3 top-2 text-faint">SIGNAL // ACQUIRING</span>
        </div>
      </div>

      {/* bottom instrument bar */}
      <div className="flex items-center justify-between border-t border-line/70 px-4 py-2 sm:px-5">
        <span className="flex items-center gap-2.5">
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[3px] origin-bottom bg-growth/70 animate-eq"
                style={{ height: 12, animationDelay: `${i * 130}ms` }}
              />
            ))}
          </span>
          <span className="lab-label text-ash">AWAITING INTAKE</span>
        </span>
        <span className="relative h-[3px] w-24 overflow-hidden bg-line">
          <span className="absolute inset-y-0 left-0 w-1/4 bg-signal/80 animate-track" />
        </span>
      </div>
    </div>
  );
}

function Tick({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 h-3 w-3 border-line/70 ${className}`}
    />
  );
}
