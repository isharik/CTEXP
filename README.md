# CT Human Experiment

A short, strange personality experiment for Crypto Twitter. Enter a handle, run
10 scenarios, get diagnosed with a CT type, an alignment, and a share card built
entirely in the browser.

Built to be screenshot-worthy first and analytical second.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- No database, no auth, no wallet, no paid services, no API keys

Vercel Hobby compatible. Deploy straight from the repo.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- `lib/questions.ts` — the 10 scenarios. Each choice quietly weights several of
  12 hidden dimensions (DEGEN, BUILDER, RESEARCHER, CHAOS, …).
- `lib/scoring.ts` — normalizes answers into 0–100 scores. Pure function of the
  answers, so the same run always produces the same profile.
- `lib/personalities.ts` — 16 archetypes plus alignment, dangerous trait,
  superpower, and red flag logic.
- `lib/result.ts` — assembles the final result and rebuilds it from the encoded
  answer string in the URL (so results are shareable and deterministic).
- The shareable PNG is the exact on-screen card, rasterized client-side with
  `html-to-image` (no third-party image service).
- `app/api/profile/route.ts` — best-effort public profile flavor with graceful
  fallback, validation, and basic in-memory rate limiting. Never fabricates data.

Everything is expandable: add questions, dimensions, or personality types in the
`lib/` files and the rest follows.

## Notes

- The questionnaire is always the primary source of the result. Public profile
  data, when available at all, is used only for a single flavor line.
- No secrets are used or exposed. Usernames are validated as handles and never
  turned into arbitrary fetch URLs.
