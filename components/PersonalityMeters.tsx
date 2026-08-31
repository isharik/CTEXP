'use client';

import { motion } from 'framer-motion';
import CountUp from './CountUp';
import type { Dimension } from '@/lib/types';

interface Props {
  meters: { dimension: Dimension; value: number }[];
}

function toneFor(value: number, rank: number): string {
  if (rank === 0) return '#e5484d';
  if (value >= 70) return '#4cc38a';
  if (value >= 40) return '#e9e9e4';
  return '#5c5c5e';
}

function RadialMeter({
  dimension,
  value,
  rank,
}: {
  dimension: Dimension;
  value: number;
  rank: number;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const tone = toneFor(value, rank);
  const delay = 0.15 + rank * 0.08;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[92px] w-[92px]">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1c1c20" strokeWidth="4" />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - value / 100) }}
            transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1], delay }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <CountUp
            value={value}
            delay={delay * 1000}
            className="numeral font-display text-2xl font-bold text-bone"
          />
        </div>
      </div>
      <span className="lab-label mt-2 text-center text-faint">{dimension}</span>
    </div>
  );
}

export default function PersonalityMeters({ meters }: Props) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="lab-label text-faint">MEASURED DIMENSIONS</span>
        <span className="h-px flex-1 bg-line" />
        <span className="lab-label text-faint">TOP 6 / 12</span>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-3 gap-y-6 sm:grid-cols-6 sm:gap-y-0"
      >
        {meters.map((m, i) => (
          <RadialMeter key={m.dimension} dimension={m.dimension} value={m.value} rank={i} />
        ))}
      </motion.div>
    </div>
  );
}
