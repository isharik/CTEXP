'use client';

import { motion } from 'framer-motion';

interface Props {
  current: number; // 1-based
  total: number;
}

export default function ProgressIndicator({ current, total }: Props) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="lab-label text-faint">EXPERIMENT</span>
        <span className="font-mono text-[12px] text-ash">
          <span className="text-bone">{pad(current)}</span>
          <span className="text-faint"> / {pad(total)}</span>
        </span>
      </div>
      <div className="flex gap-1" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current;
          const active = i === current - 1;
          return (
            <div key={i} className="h-[3px] flex-1 overflow-hidden bg-line">
              <motion.div
                initial={false}
                animate={{ scaleX: filled ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: 'left' }}
                className={`h-full ${active ? 'bg-signal' : 'bg-bone'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
