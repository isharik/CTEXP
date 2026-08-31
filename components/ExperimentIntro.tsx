'use client';

import { motion } from 'framer-motion';

const RULES = [
  'No overthinking.',
  'No cheating.',
  'Your first instinct is probably worse than you think.',
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] } },
};

export default function ExperimentIntro({
  username,
  avatar,
  onBegin,
}: {
  username: string;
  avatar?: string;
  onBegin: () => void;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:px-6"
    >
      <motion.span variants={item} className="lab-label text-growth">
        SUBJECT IDENTIFIED
      </motion.span>

      <motion.div variants={item} className="mt-3 flex items-center gap-3">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-16 w-16 flex-none rounded-full border border-line object-cover shadow-[0_0_24px_rgba(76,195,138,0.18)]"
          />
        ) : (
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full border border-line bg-panel font-display text-2xl font-bold text-faint">
            {username.charAt(0).toUpperCase()}
          </span>
        )}
        <h2 className="font-mono text-2xl tracking-tight text-bone">@{username}</h2>
      </motion.div>

      <motion.p variants={item} className="mt-3 font-mono text-[12px] text-faint">
        Beginning behavioral assessment.
      </motion.p>

      <motion.div variants={item} className="my-8 h-px w-full bg-line" />

      <motion.span variants={item} className="lab-label text-faint">
        RULES
      </motion.span>

      <ul className="mt-4 space-y-3">
        {RULES.map((r, i) => (
          <motion.li
            key={r}
            variants={item}
            className="flex items-start gap-3 text-[15px] leading-snug text-bone/90"
          >
            <span className="mt-1 font-mono text-[11px] text-signal">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{r}</span>
          </motion.li>
        ))}
      </ul>

      <motion.button
        variants={item}
        type="button"
        onClick={onBegin}
        className="btn-lab mt-10 w-full border border-bone/80 bg-bone px-6 py-4 text-[13px] text-void hover:bg-white"
      >
        BEGIN
      </motion.button>
    </motion.div>
  );
}
