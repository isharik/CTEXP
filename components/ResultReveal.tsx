'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PersonalityMeters from './PersonalityMeters';
import AlignmentChart from './AlignmentChart';
import ShareCard from './ShareCard';
import type { ProfileFlavor, Result } from '@/lib/types';

const section = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

export default function ResultReveal({
  result,
  shareUrl,
}: {
  result: Result;
  shareUrl: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [profile, setProfile] = useState<ProfileFlavor | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1700);
    return () => clearTimeout(t);
  }, []);

  // Optional public flavor — never the source of the result, only garnish.
  useEffect(() => {
    let alive = true;
    fetch(`/api/profile?u=${encodeURIComponent(result.username)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ProfileFlavor | null) => {
        if (alive && d) setProfile(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [result.username]);

  const p = result.personality;

  return (
    <div className="relative flex-1">
      <AnimatePresence>
        {!revealed && (
          <motion.button
            type="button"
            onClick={() => setRevealed(true)}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-void px-6 text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lab-label text-growth"
            >
              ● ANALYSIS COMPLETE
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
              className="mt-4 max-w-md font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl"
            >
              SUBJECT ANALYSIS COMPLETE.
            </motion.p>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 font-mono text-[11px] text-faint"
            >
              tap to open the file
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate={revealed ? 'show' : 'hidden'}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6"
      >
        {/* Type header */}
        <motion.div variants={section}>
          <div className="flex items-center gap-3">
            <span className="lab-label text-faint">YOUR CT TYPE</span>
            <span className="h-px flex-1 bg-line" />
            <span className="lab-label text-faint">SUBJECT FILE</span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Avatar src={profile?.avatar} username={result.username} />
            <div>
              <p className="font-mono text-lg leading-none text-bone">@{result.username}</p>
              <p className="mt-1.5 lab-label text-growth">● SUBJECT CONFIRMED</p>
            </div>
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[0.98] tracking-tight text-balance sm:text-6xl">
            {p.title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-bone/90 sm:text-lg">
            {p.description}
          </p>
        </motion.div>

        {/* Detail grid */}
        <motion.dl
          variants={section}
          className="mt-8 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2"
        >
          <Detail label="STRENGTH" tone="growth" value={p.strengths} />
          <Detail label="WEAKNESS" tone="signal" value={p.weakness} />
          <Detail label="BEHAVIORAL PATTERN" value={p.behavioralPattern} />
          <Detail label="FIELD OBSERVATION" value={p.observation} />
        </motion.dl>

        {/* Meters */}
        <motion.div variants={section} className="mt-12">
          <PersonalityMeters meters={result.headline} />
        </motion.div>

        {/* Alignment */}
        <motion.div variants={section} className="mt-14">
          <AlignmentChart scores={result.scores} label={result.alignment} />
        </motion.div>

        {/* Trait / superpower / red flag / role */}
        <motion.div variants={section} className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Highlight
            label="MOST DANGEROUS TRAIT"
            tone="signal"
            value={result.dangerousTrait}
          />
          <Highlight
            label="SECRET SUPERPOWER"
            tone="growth"
            value={result.superpower}
          />
          <Highlight label="CT RED FLAG" value={result.redFlag} />
          <Highlight label="CT ROLE" value={result.role} big />
        </motion.div>

        {/* Optional public flavor — honest about availability */}
        {profile && (
          <motion.div variants={section} className="mt-8">
            <p className="lab-label mb-2 text-faint">FIELD NOTE</p>
            {profile.available ? (
              <p className="font-mono text-[12px] leading-relaxed text-ash">
                Public signal detected
                {profile.displayName ? ` for "${profile.displayName}"` : ''}. Used
                for flavor only — your answers did the real work.
              </p>
            ) : profile.avatar ? (
              <p className="font-mono text-[12px] leading-relaxed text-ash">
                Profile picture pulled from X. Everything else on this file is
                you — your answers did the real work.
              </p>
            ) : (
              <p className="font-mono text-[12px] leading-relaxed text-faint">
                {profile.note}
              </p>
            )}
          </motion.div>
        )}

        {/* Share */}
        <motion.div variants={section} className="mt-14">
          <ShareCard result={result} shareUrl={shareUrl} avatar={profile?.avatar} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Avatar({ src, username }: { src?: string; username: string }) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <div className="relative h-20 w-20 flex-none overflow-hidden rounded-full border border-line bg-panel shadow-[0_0_30px_rgba(229,72,77,0.15)]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`@${username} profile picture`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-faint">
          {initial}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
    </div>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'growth' | 'signal';
}) {
  const toneClass =
    tone === 'growth' ? 'text-growth' : tone === 'signal' ? 'text-signal' : 'text-faint';
  return (
    <div className="bg-ink p-5">
      <dt className={`lab-label ${toneClass}`}>{label}</dt>
      <dd className="mt-2 text-[14px] leading-snug text-bone/90">{value}</dd>
    </div>
  );
}

function Highlight({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone?: 'growth' | 'signal';
  big?: boolean;
}) {
  const toneClass =
    tone === 'growth' ? 'text-growth' : tone === 'signal' ? 'text-signal' : 'text-faint';
  return (
    <div className="border border-line bg-panel/50 p-5">
      <p className={`lab-label ${toneClass}`}>{label}</p>
      <p
        className={`mt-2 leading-snug text-bone ${
          big ? 'font-display text-xl font-semibold tracking-tight' : 'text-[14px]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
