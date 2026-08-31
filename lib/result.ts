import { QUESTION_COUNT, selectQuestions } from './questions';
import { computeScores, rankDimensions } from './scoring';
import {
  buildFlavor,
  computeAlignment,
  selectPersonality,
} from './personalities';
import type { Result } from './types';
import { decodeAnswers, normalizeUsername } from './validation';

/** Assemble the full deterministic result from a handle and answer indices. */
export function buildResult(usernameRaw: string, answers: number[]): Result {
  const username = normalizeUsername(usernameRaw);
  const questions = selectQuestions(username);
  const scores = computeScores(answers, questions);
  const personality = selectPersonality(scores, username);
  const alignment = computeAlignment(scores);
  const flavor = buildFlavor(scores, username);
  const headline = rankDimensions(scores).slice(0, 6);

  return {
    username,
    scores,
    personality,
    alignment: alignment.label,
    role: personality.role,
    dangerousTrait: flavor.dangerousTrait,
    superpower: flavor.superpower,
    redFlag: flavor.redFlag,
    headline,
  };
}

/** Rebuild a result from an encoded answer string, or null if it is malformed. */
export function resultFromEncoded(
  username: string,
  encoded: string | null | undefined,
): Result | null {
  if (!encoded) return null;
  const answers = decodeAnswers(encoded, QUESTION_COUNT);
  if (!answers) return null;
  return buildResult(username, answers);
}
