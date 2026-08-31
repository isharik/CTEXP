import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Lab surface palette — near-black, layered
        void: '#080809',
        ink: '#0b0b0d',
        panel: '#101013',
        raised: '#16161a',
        line: '#232327',
        // Text — lifted for legibility over the live grid background
        bone: '#edede8',
        ash: '#b2b1ac',
        faint: '#83837f',
        // Restrained signal accents
        signal: '#e5484d', // red
        growth: '#4cc38a', // green
        amber: '#e8b84b',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        label: '0.24em',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        inout: 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0.15' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(0.6%, -0.6%)' },
        },
        spinslow: {
          to: { transform: 'rotate(360deg)' },
        },
        countpulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        aura: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.94)' },
          '50%': { opacity: '0.78', transform: 'scale(1.07)' },
        },
        wobble3d: {
          '0%, 100%': { transform: 'rotateX(10deg) rotateY(-12deg)' },
          '50%': { transform: 'rotateX(16deg) rotateY(12deg)' },
        },
        track: {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(340%)' },
        },
        eq: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        comet: {
          // Position only — the "beat" itself lives in `heartbeat` below, on
          // a different property, so the two can run together with no
          // conflict. Both are transform/opacity/left: compositor-cheap.
          '0%': { left: '-4%' },
          '100%': { left: '104%' },
        },
        heartbeat: {
          // A quick lub-dub pulse rather than a smooth constant glow.
          // Keeps the element's own translateY(-50%) centering intact —
          // a raw `transform` here would otherwise silently replace it.
          '0%, 100%': { transform: 'translateY(-50%) scale(1)', opacity: '0.55' },
          '10%': { transform: 'translateY(-50%) scale(1.8)', opacity: '1' },
          '20%': { transform: 'translateY(-50%) scale(1)', opacity: '0.55' },
          '30%': { transform: 'translateY(-50%) scale(1.4)', opacity: '0.85' },
          '45%': { transform: 'translateY(-50%) scale(1)', opacity: '0.5' },
        },
      },
      animation: {
        blink: 'blink 1.6s steps(1) infinite',
        scan: 'scan 7s linear infinite',
        drift: 'drift 12s ease-in-out infinite',
        spinslow: 'spinslow 22s linear infinite',
        countpulse: 'countpulse 2s ease-in-out infinite',
        aura: 'aura 4s ease-in-out infinite',
        wobble3d: 'wobble3d 9s ease-in-out infinite',
        track: 'track 2.8s ease-in-out infinite',
        eq: 'eq 1.1s ease-in-out infinite',
        comet: 'comet 3.4s linear infinite, heartbeat 1.05s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
