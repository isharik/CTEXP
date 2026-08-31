/**
 * X/Twitter handle rules: 1-15 characters, letters/digits/underscore only.
 * We never fetch arbitrary URLs from this — it is only ever used as a handle.
 */
const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '');
}

export function isValidUsername(raw: string): boolean {
  return HANDLE_RE.test(normalizeUsername(raw));
}

export function usernameError(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (u.length === 0) return 'Enter a handle to continue.';
  if (u.length > 15) return 'Handles cap out at 15 characters.';
  if (!HANDLE_RE.test(u)) return 'Letters, numbers and underscores only.';
  return null;
}

/** Compact answer encoding: one digit per question (choice index 0-8). */
export function encodeAnswers(answers: number[]): string {
  return answers.map((a) => Math.max(0, Math.min(8, a)).toString()).join('');
}

export function decodeAnswers(raw: string, expectedLength: number): number[] | null {
  if (!/^[0-8]+$/.test(raw)) return null;
  if (raw.length !== expectedLength) return null;
  return raw.split('').map((c) => parseInt(c, 10));
}
