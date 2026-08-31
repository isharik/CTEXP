'use client';

import { motion } from 'framer-motion';

/**
 * The brief deadpan reaction shown between questions ("Noted.", "Concerning.").
 * Overlays the question, then the runner advances.
 */
export default function ExperimentTransition({ reaction }: { reaction: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-void/85 backdrop-blur-[2px]"
    >
      <motion.span
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="lab-label mb-3 text-signal"
      >
        RESPONSE LOGGED
      </motion.span>
      <motion.p
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1], delay: 0.04 }}
        className="font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl"
      >
        {reaction}
      </motion.p>
    </motion.div>
  );
}
