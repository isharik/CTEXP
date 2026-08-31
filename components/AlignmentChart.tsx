'use client';

import { motion } from 'framer-motion';
import { computeAlignment } from '@/lib/personalities';
import type { Alignment, Scores } from '@/lib/types';

export default function AlignmentChart({
  scores,
  label,
}: {
  scores: Scores;
  label: Alignment;
}) {
  const { x, y } = computeAlignment(scores);
  const px = 50 + x * 38;
  const py = 50 - y * 38;

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="lab-label text-faint">YOUR CT ALIGNMENT</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-[280px]">
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            {/* grid */}
            {[25, 50, 75].map((g) => (
              <g key={g}>
                <line x1={g} y1="4" x2={g} y2="96" stroke="#17171a" strokeWidth="0.4" />
                <line x1="4" y1={g} x2="96" y2={g} stroke="#17171a" strokeWidth="0.4" />
              </g>
            ))}
            {/* axes */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="#2c2c30" strokeWidth="0.6" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="#2c2c30" strokeWidth="0.6" />

            {/* target rings + marker */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <motion.circle
                cx={px}
                cy={py}
                r="7"
                fill="none"
                stroke="#e5484d"
                strokeWidth="0.5"
                initial={{ r: 14, opacity: 0 }}
                animate={{ r: 7, opacity: 0.7 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 120, damping: 12 }}
              />
              <line x1={px - 9} y1={py} x2={px + 9} y2={py} stroke="#e5484d" strokeWidth="0.4" opacity="0.6" />
              <line x1={px} y1={py - 9} x2={px} y2={py + 9} stroke="#e5484d" strokeWidth="0.4" opacity="0.6" />
              <motion.circle
                cx={px}
                cy={py}
                r="3"
                fill="#e5484d"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 16 }}
                style={{ transformOrigin: `${px}px ${py}px` }}
              />
            </motion.g>
          </svg>

          {/* axis labels */}
          <span className="lab-label absolute -top-1 left-1/2 -translate-x-1/2 text-faint">
            STRUCTURE
          </span>
          <span className="lab-label absolute -bottom-1 left-1/2 -translate-x-1/2 text-faint">
            IMPULSE
          </span>
          <span className="lab-label absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-faint">
            LAWFUL
          </span>
          <span className="lab-label absolute right-0 top-1/2 -translate-y-1/2 rotate-90 origin-right text-faint">
            CHAOTIC
          </span>
        </div>

        <div>
          <p className="lab-label text-faint">CLASSIFICATION</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-bone sm:text-3xl">
            {label}
          </p>
          <p className="mt-4 max-w-xs font-mono text-[12px] leading-relaxed text-ash">
            Plotted from twelve behavioral axes. The crosshair is you. It is not a
            compliment or an insult — it is a coordinate.
          </p>
        </div>
      </div>
    </div>
  );
}
