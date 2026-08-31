import { hashString } from './scoring';
import type { ProfileFlavor } from './types';

/**
 * When no public profile data can be safely retrieved, we do NOT invent
 * follower counts or bios. We return a deterministic, clearly-flavor-only
 * "field note" derived from the handle itself, and mark data as unavailable.
 */
const FIELD_NOTES = [
  'Subject located by handle only. Behavioral data pending questionnaire.',
  'No public telemetry retrieved. Proceeding on self-report.',
  'Profile signal weak. The experiment is the measurement.',
  'Handle logged. Everything else, we will have to ask you.',
];

export function fallbackProfile(username: string): ProfileFlavor {
  const salt = hashString(username.toLowerCase());
  return {
    available: false,
    username,
    note: FIELD_NOTES[salt % FIELD_NOTES.length],
  };
}
