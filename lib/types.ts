// Hidden personality dimensions. The user never sees these labels while answering.
export const DIMENSIONS = [
  'DEGEN',
  'BUILDER',
  'RESEARCHER',
  'CHAOS',
  'COMMUNITY',
  'CONVICTION',
  'FOMO',
  'CONTRARIAN',
  'MEME',
  'RISK',
  'LOYALTY',
  'CURIOSITY',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

// Partial weight map: an answer nudges several dimensions at once.
export type Weights = Partial<Record<Dimension, number>>;

export interface Choice {
  /** Short key shown as the answer marker, e.g. "A" */
  key: string;
  label: string;
  weights: Weights;
}

export interface Question {
  id: number;
  /** Experimental section label, e.g. "STIMULUS" / "PRESSURE TEST" */
  tag: string;
  prompt: string;
  /** Optional second line of framing */
  sub?: string;
  choices: Choice[];
}

/** Final normalized scores, 0-100 per dimension. */
export type Scores = Record<Dimension, number>;

export type Alignment =
  | 'Lawful Builder'
  | 'Chaotic Builder'
  | 'Neutral Degen'
  | 'Chaotic Degen'
  | 'Lawful Researcher'
  | 'Chaotic Researcher'
  | 'Neutral NPC';

export type Role =
  | 'Builder'
  | 'Degen'
  | 'Researcher'
  | 'Community'
  | 'Meme Lord'
  | 'Narrative Hunter'
  | 'Lurker'
  | 'Founder'
  | 'Reply Guy'
  | 'Observer';

export interface Personality {
  id: string;
  title: string;
  description: string;
  strengths: string;
  weakness: string;
  behavioralPattern: string;
  observation: string;
  role: Role;
  /** Which dimensions this type is built around (ranked most-first). */
  signature: Dimension[];
}

export interface ProfileFlavor {
  available: boolean;
  username: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  following?: number;
  /** Data-URI of the public profile picture, if one could be retrieved. */
  avatar?: string;
  /** Human-readable note about data source / availability. */
  note: string;
}

export interface Result {
  username: string;
  scores: Scores;
  personality: Personality;
  alignment: Alignment;
  role: Role;
  dangerousTrait: string;
  superpower: string;
  redFlag: string;
  /** The six dimensions surfaced on the reveal + card, ranked. */
  headline: { dimension: Dimension; value: number }[];
}
