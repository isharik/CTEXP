'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LINES = [
  'IDENTIFYING SUBJECT…',
  'CALIBRATING QUESTIONS…',
  'REMOVING OBJECTIVITY…',
  'PREPARING PSYCHOLOGICAL DAMAGE…',
];

const STEP_MS = 620;

export default function LoadingSequence({
  username,
  onDone,
}: {
  username: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= LINES.length) {
      const t = setTimeout(onDone, 360);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-10 h-14 w-14">
        <span className="absolute inset-0 animate-spinslow rounded-full border border-line [animation-duration:3s] motion-reduce:animate-none" />
        <span className="absolute inset-0 rounded-full border-t border-signal animate-spinslow [animation-duration:1s] motion-reduce:animate-none" />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-faint">
          {Math.min(step, LINES.length)}/{LINES.length}
        </span>
      </div>

      <span className="lab-label mb-6 text-faint">
        SUBJECT @{username}
      </span>

      <div className="h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="font-mono text-[13px] tracking-[0.12em] text-bone"
          >
            {LINES[Math.min(step, LINES.length - 1)]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex w-full max-w-xs gap-1">
        {LINES.map((_, i) => (
          <div key={i} className="h-[2px] flex-1 overflow-hidden bg-line">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < step ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-full bg-bone"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
