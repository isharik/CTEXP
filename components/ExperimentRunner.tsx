'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import LabFrame from './LabFrame';
import LoadingSequence from './LoadingSequence';
import ExperimentIntro from './ExperimentIntro';
import ProgressIndicator from './ProgressIndicator';
import QuestionCard from './QuestionCard';
import ExperimentTransition from './ExperimentTransition';
import { QUESTION_COUNT, REACTIONS, selectQuestions } from '@/lib/questions';
import { encodeAnswers } from '@/lib/validation';

type Phase = 'loading' | 'intro' | 'running';

const SELECT_HOLD = 240; // let the pressed state register
const REACTION_HOLD = 780; // how long the reaction lingers

export default function ExperimentRunner({ username }: { username: string }) {
  const router = useRouter();
  const questions = useMemo(() => selectQuestions(username), [username]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const answers = useRef<number[]>([]);
  const locked = useRef(false);

  // Pull the public avatar early so the intro can greet the actual subject.
  useEffect(() => {
    let alive = true;
    fetch(`/api/profile?u=${encodeURIComponent(username)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.avatar) setAvatar(d.avatar);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [username]);

  const finish = useCallback(
    (all: number[]) => {
      const encoded = encodeAnswers(all);
      try {
        sessionStorage.setItem(`ct:${username.toLowerCase()}`, encoded);
      } catch {
        /* storage may be unavailable; the URL param carries the result anyway */
      }
      router.push(`/result/${encodeURIComponent(username)}?a=${encoded}`);
    },
    [router, username],
  );

  const onAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked.current) return;
      locked.current = true;
      setSelected(choiceIndex);

      const pick =
        REACTIONS[(index * 3 + choiceIndex) % REACTIONS.length];

      setTimeout(() => {
        setReaction(pick);
        setTimeout(() => {
          const next = [...answers.current, choiceIndex];
          answers.current = next;
          setReaction(null);

          if (next.length >= QUESTION_COUNT) {
            finish(next);
            return;
          }
          setSelected(null);
          setIndex((i) => i + 1);
          locked.current = false;
        }, REACTION_HOLD);
      }, SELECT_HOLD);
    },
    [index, finish],
  );

  const status =
    phase === 'running' ? `Q${String(index + 1).padStart(2, '0')} / ${QUESTION_COUNT}` : 'IN SESSION';

  return (
    <LabFrame status={status} code="ASSESSMENT">
      {phase === 'loading' && (
        <LoadingSequence username={username} onDone={() => setPhase('intro')} />
      )}

      {phase === 'intro' && (
        <ExperimentIntro username={username} avatar={avatar} onBegin={() => setPhase('running')} />
      )}

      {phase === 'running' && (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-6 sm:px-6 sm:py-10">
          <ProgressIndicator current={index + 1} total={QUESTION_COUNT} />

          <div className="relative mt-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              >
                <QuestionCard
                  question={questions[index]}
                  index={index}
                  selected={selected}
                  disabled={locked.current}
                  onAnswer={onAnswer}
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {reaction && <ExperimentTransition reaction={reaction} />}
            </AnimatePresence>
          </div>
        </div>
      )}
    </LabFrame>
  );
}
