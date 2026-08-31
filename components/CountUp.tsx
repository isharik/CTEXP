'use client';

import { useEffect, useRef, useState } from 'react';

/** Eased count-up from 0 to `value`. Respects reduced motion. */
export default function CountUp({
  value,
  duration = 1100,
  delay = 0,
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let start: number | null = null;
    const startTimer = setTimeout(() => {
      const tick = (t: number) => {
        if (start === null) start = t;
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setDisplay(Math.round(eased * value));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration, delay]);

  return <span className={className}>{display}</span>;
}
