'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { normalizeUsername, usernameError } from '@/lib/validation';

export default function UsernameForm() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = usernameError(value);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);
    const u = normalizeUsername(value);
    router.push(`/experiment?u=${encodeURIComponent(u)}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <label htmlFor="handle" className="lab-label mb-2 block text-faint">
        SUBJECT IDENTIFIER
      </label>

      <div
        className={`group flex items-center gap-2 border bg-panel/60 px-4 transition-colors duration-200 ${
          error ? 'border-signal/70' : 'border-line focus-within:border-bone/50'
        }`}
      >
        <span className="font-mono text-lg text-ash">@</span>
        <input
          id="handle"
          name="handle"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          placeholder="username"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          maxLength={20}
          className="w-full bg-transparent py-4 font-mono text-lg text-bone placeholder:text-faint focus:outline-none"
          aria-invalid={!!error}
          aria-describedby={error ? 'handle-error' : undefined}
        />
      </div>

      <div className="mt-2 min-h-[18px]" aria-live="polite">
        {error && (
          <motion.p
            id="handle-error"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[12px] text-signal"
          >
            {error}
          </motion.p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-lab mt-4 w-full border border-bone/80 bg-bone px-6 py-4 text-[13px] text-void hover:bg-white disabled:opacity-60"
      >
        {submitting ? 'IDENTIFYING…' : 'ENTER THE EXPERIMENT'}
      </button>

      <p className="mt-3 font-mono text-[11px] leading-relaxed text-faint">
        Handle only. No login, no wallet, no data stored. We just need something
        to put on the file.
      </p>
    </form>
  );
}
