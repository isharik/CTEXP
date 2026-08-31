'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/lib/types';

interface Props {
  question: Question;
  index: number; // 0-based
  selected: number | null;
  disabled: boolean;
  onAnswer: (choiceIndex: number) => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.23, 1, 0.32, 1] } },
};

export default function QuestionCard({
  question,
  index,
  selected,
  disabled,
  onAnswer,
}: Props) {
  // Keyboard shortcuts: A–E and 1–5 pick the matching choice.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (disabled) return;
      const k = e.key.toLowerCase();
      let idx = -1;
      if (/^[a-e]$/.test(k)) idx = k.charCodeAt(0) - 97;
      else if (/^[1-5]$/.test(k)) idx = parseInt(k, 10) - 1;
      if (idx >= 0 && idx < question.choices.length) {
        e.preventDefault();
        onAnswer(idx);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, disabled, onAnswer]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-xl flex-col"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <span className="numeral font-display text-5xl font-bold leading-none text-line sm:text-6xl">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="lab-label text-faint">{question.tag}</span>
      </motion.div>

      <motion.h2
        variants={item}
        className="mt-5 text-balance text-[1.55rem] font-semibold leading-tight tracking-tight text-bone sm:text-3xl"
      >
        {question.prompt}
      </motion.h2>

      {question.sub && (
        <motion.p variants={item} className="mt-2 font-mono text-[12px] text-faint">
          {question.sub}
        </motion.p>
      )}

      <motion.ul variants={item} className="mt-7 flex flex-col gap-2.5">
        {question.choices.map((choice, i) => {
          const isSel = selected === i;
          return (
            <li key={choice.key}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAnswer(i)}
                aria-pressed={isSel}
                className={`btn-lab group w-full items-stretch gap-3 border px-3.5 py-3.5 text-left normal-case tracking-normal transition-colors duration-200 sm:px-4 ${
                  isSel
                    ? 'border-bone bg-bone/95 text-void'
                    : 'border-line bg-panel/50 text-bone hover:border-bone/40 hover:bg-raised'
                } disabled:cursor-default`}
              >
                <span className="flex w-full items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center border font-mono text-[11px] ${
                      isSel
                        ? 'border-void/30 bg-void/10 text-void'
                        : 'border-line text-ash group-hover:border-bone/40 group-hover:text-bone'
                    }`}
                  >
                    {choice.key}
                  </span>
                  <span className="pt-0.5 font-display text-[15px] leading-snug sm:text-base">
                    {choice.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </motion.ul>

      <motion.p variants={item} className="mt-5 hidden font-mono text-[10px] text-faint sm:block">
        TIP — PRESS A–E OR 1–5. FIRST INSTINCT ONLY.
      </motion.p>
    </motion.div>
  );
}
