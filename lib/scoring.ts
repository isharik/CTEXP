import { DIMENSIONS, type Dimension, type Question, type Scores } from './types';

/** Stable string hash (djb2). Used for deterministic seeding and tie-breaking. */
export function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

interface Range {
  min: number;
  max: number;
}

/** Smallest/largest total each dimension can reach across a given question set. */
function computeRanges(questions: Question[]): Record<Dimension, Range> {
  const ranges = Object.fromEntries(
    DIMENSIONS.map((d) => [d, { min: 0, max: 0 }]),
  ) as Record<Dimension, Range>;

  for (const q of questions) {
    for (const d of DIMENSIONS) {
      const values = q.choices.map((c) => c.weights[d] ?? 0);
      ranges[d].min += Math.min(...values, 0);
      ranges[d].max += Math.max(...values, 0);
    }
  }
  return ranges;
}

/**
 * Turn an array of chosen choice-indices (one per question, in order) into
 * normalized 0-100 scores against the specific question set that was answered.
 * Purely a function of the answers + questions.
 */
export function computeScores(answers: number[], questions: Question[]): Scores {
  const ranges = computeRanges(questions);
  const raw = Object.fromEntries(DIMENSIONS.map((d) => [d, 0])) as Record<
    Dimension,
    number
  >;

  questions.forEach((q, i) => {
    const choice = q.choices[answers[i]];
    if (!choice) return;
    for (const d of DIMENSIONS) {
      raw[d] += choice.weights[d] ?? 0;
    }
  });

  const scores = {} as Scores;
  for (const d of DIMENSIONS) {
    const { min, max } = ranges[d];
    const span = max - min;
    const pct = span === 0 ? 50 : ((raw[d] - min) / span) * 100;
    // Gentle curve toward the middle so nobody sits at a flat 0 or 100.
    const eased = 8 + pct * 0.84;
    scores[d] = Math.round(Math.min(100, Math.max(0, eased)));
  }
  return scores;
}

/** Dimensions sorted highest-first. */
export function rankDimensions(scores: Scores): { dimension: Dimension; value: number }[] {
  return DIMENSIONS.map((d) => ({ dimension: d, value: scores[d] })).sort(
    (a, b) => b.value - a.value || a.dimension.localeCompare(b.dimension),
  );
}
