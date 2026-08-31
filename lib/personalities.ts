import { hashString, rankDimensions } from './scoring';
import { DIMENSIONS } from './types';
import type {
  Alignment,
  Dimension,
  Personality,
  Role,
  Scores,
} from './types';

/**
 * 16 archetypes. `signature` lists the dimensions the type is built around,
 * most-defining first — the selector rewards matches near the front.
 */
export const PERSONALITIES: Personality[] = [
  {
    id: 'chaotic-builder',
    title: 'THE CHAOTIC BUILDER',
    description:
      'You somehow manage to be both extremely rational and completely unreasonable. You ship real things, then bet the treasury on a dog.',
    strengths: 'You actually build, and you move faster than committees can meet.',
    weakness: 'Impulse control is a feature you have not merged yet.',
    behavioralPattern: 'Deploys to mainnet at 3am, apes at 3:05am.',
    observation: 'Half your genius and all your damage come from the same button.',
    role: 'Builder',
    signature: ['BUILDER', 'CHAOS', 'DEGEN', 'CURIOSITY'],
  },
  {
    id: 'professional-degen',
    title: 'THE PROFESSIONAL DEGEN',
    description:
      'Gambling, but with a spreadsheet open. You have turned poor decisions into a repeatable process, and honestly the process works more than it should.',
    strengths: 'Unmatched speed, iron stomach, no hesitation on entries.',
    weakness: 'You confuse conviction with not having read anything.',
    behavioralPattern: 'Rotates capital before most people finish their coffee.',
    observation: 'Your risk tolerance is not a number, it is a personality.',
    role: 'Degen',
    signature: ['DEGEN', 'RISK', 'FOMO', 'CHAOS'],
  },
  {
    id: 'silent-researcher',
    title: 'THE SILENT RESEARCHER',
    description:
      'You read the docs, the code, and the founder\'s deleted tweets. You say little and know everything. The timeline underestimates you, which suits you fine.',
    strengths: 'Depth. You are right far more often than you are loud.',
    weakness: 'By the time you are certain, the move is already gone.',
    behavioralPattern: 'Twelve tabs open, zero posts sent.',
    observation: 'You have the best takes and the fewest impressions.',
    role: 'Researcher',
    signature: ['RESEARCHER', 'CURIOSITY', 'CONVICTION', 'COMMUNITY'],
  },
  {
    id: 'community-goblin',
    title: 'THE COMMUNITY GOBLIN',
    description:
      'You do not care about the price, you care about the people. Every Discord is your living room and every gm is sincere. Somehow this is a strategy now.',
    strengths: 'You turn strangers into a network and a network into a family.',
    weakness: 'Loyalty makes you hold things long past their expiry date.',
    behavioralPattern: 'Knows everyone, mods three servers, sleeps never.',
    observation: 'You would take a bad trade for a good friend.',
    role: 'Community',
    signature: ['COMMUNITY', 'LOYALTY', 'MEME', 'FOMO'],
  },
  {
    id: 'narrative-maximalist',
    title: 'THE NARRATIVE MAXIMALIST',
    description:
      'You do not buy tokens, you buy stories. When you find a thesis you like, you cannot stop, and you will not stop, until everyone has heard the 19-post version.',
    strengths: 'You see the next meta while it is still a whisper.',
    weakness: 'You mistake a good story for a good balance sheet.',
    behavioralPattern: 'One conviction at a time, at maximum volume.',
    observation: 'You cannot leave a narrative alone once it convinces you.',
    role: 'Narrative Hunter',
    signature: ['CONVICTION', 'FOMO', 'CONTRARIAN', 'COMMUNITY'],
  },
  {
    id: 'reply-merchant',
    title: 'THE REPLY MERCHANT',
    description:
      'The main character of every thread you did not start. You have never seen a take you could not improve, and the replies are your natural habitat.',
    strengths: 'Fast, funny, and impossible to ignore.',
    weakness: 'You would rather be entertaining than correct.',
    behavioralPattern: 'First reply, every time, quote-tweet loaded.',
    observation: 'Your best content lives entirely under other people\'s posts.',
    role: 'Reply Guy',
    signature: ['COMMUNITY', 'MEME', 'CONTRARIAN', 'CHAOS'],
  },
  {
    id: 'the-contrarian',
    title: 'THE CONTRARIAN',
    description:
      'If CT agrees on it, you are already skeptical. Sometimes this makes you early. Sometimes it just makes you alone. You have made peace with both.',
    strengths: 'Immune to hype, allergic to the herd.',
    weakness: 'You have said no to a few life-changing yeses.',
    behavioralPattern: 'Fades the crowd on reflex, checks the reasoning later.',
    observation: 'Being contrarian is not the same as being right, but you keep testing it.',
    role: 'Observer',
    signature: ['CONTRARIAN', 'CONVICTION', 'RESEARCHER', 'CHAOS'],
  },
  {
    id: 'perma-bull',
    title: 'THE PERMA-BULL',
    description:
      'Everything is up only, eventually, in your timezone. Your optimism has survived four cycles and roughly nine hundred people telling you it is over.',
    strengths: 'You hold through the winters that shake everyone else out.',
    weakness: 'You have never met a top you believed in.',
    behavioralPattern: 'Buys the dip, then buys the dip on the dip.',
    observation: 'You have mistaken being early for being right, repeatedly, on purpose.',
    role: 'Degen',
    signature: ['CONVICTION', 'DEGEN', 'RISK', 'LOYALTY'],
  },
  {
    id: 'perma-bear',
    title: 'THE PERMA-BEAR',
    description:
      'You have called every top since 2021, including the ones that never came. Correct in spirit, early in practice, and never happier than during a drawdown.',
    strengths: 'You see the rot before the chart does.',
    weakness: 'Caution has cost you more than any rug ever did.',
    behavioralPattern: 'Screenshots the warning, waits to be vindicated.',
    observation: 'You are the smartest person to have missed the entire run.',
    role: 'Observer',
    signature: ['CONTRARIAN', 'RESEARCHER', 'CONVICTION', 'RISK'],
  },
  {
    id: 'alpha-archaeologist',
    title: 'THE ALPHA ARCHAEOLOGIST',
    description:
      'You dig through GitHub, dead Discords, and testnet contracts for coins nobody has named yet. You are usually early. You are occasionally too early to matter.',
    strengths: 'You find the thing before it has a logo.',
    weakness: 'Being months early feels a lot like being wrong.',
    behavioralPattern: 'Reads changelogs for fun, tracks wallets for sport.',
    observation: 'You can smell a narrative before it becomes mainstream.',
    role: 'Narrative Hunter',
    signature: ['RESEARCHER', 'CURIOSITY', 'CONTRARIAN', 'BUILDER'],
  },
  {
    id: 'the-lurker',
    title: 'THE LURKER',
    description:
      'You see everything and post nothing. Your bookmarks are a treasure vault. Your following list is a curated intelligence agency. Your last tweet was in 2022.',
    strengths: 'Perspective. You watch the whole board without being on it.',
    weakness: 'Nobody knows how right you were, including you.',
    behavioralPattern: 'Reads the whole timeline, leaves no trace.',
    observation: 'You are the quietest genius in a room that never sees you.',
    role: 'Lurker',
    signature: ['CURIOSITY', 'RESEARCHER', 'CONTRARIAN', 'CONVICTION'],
  },
  {
    id: 'fomo-machine',
    title: 'THE FOMO MACHINE',
    description:
      'You feel the pump in your body before it hits the chart. Every green candle is a personal invitation. You are early to nothing and present for everything.',
    strengths: 'You are never not in the room where it happens.',
    weakness: 'You buy the top with the confidence of someone buying the bottom.',
    behavioralPattern: 'Sees a wick, joins the wick.',
    observation: 'Your entire strategy is other people\'s excitement.',
    role: 'Degen',
    signature: ['FOMO', 'DEGEN', 'RISK', 'COMMUNITY'],
  },
  {
    id: 'founder-in-disguise',
    title: 'THE FOUNDER IN DISGUISE',
    description:
      'You show up as a normal poster, but you are quietly building the thing everyone will use next year. The shitposts are camouflage. The commits are the real account.',
    strengths: 'You create the tools other people speculate on.',
    weakness: 'You will grind in silence long past the point of self-care.',
    behavioralPattern: 'Ships quietly, announces reluctantly.',
    observation: 'One day the anon dev is you, and it always was.',
    role: 'Founder',
    signature: ['BUILDER', 'CONVICTION', 'RESEARCHER', 'CURIOSITY'],
  },
  {
    id: 'ct-philosopher',
    title: 'THE CT PHILOSOPHER',
    description:
      'You are not here for gains, you are here for the human condition, denominated in ETH. Your timeline is half market structure and half quiet existential dread.',
    strengths: 'You see the game behind the game.',
    weakness: 'You can theorize about a trade until it is no longer available.',
    behavioralPattern: 'Turns a price question into a meditation on meaning.',
    observation: 'You have posted a 3am thread that changed exactly one life: your own.',
    role: 'Observer',
    signature: ['CURIOSITY', 'CONVICTION', 'CONTRARIAN', 'RESEARCHER'],
  },
  {
    id: 'meme-lord',
    title: 'THE MEME LORD',
    description:
      'You speak fluent timeline. A single image from you can move a chart, or at least a group chat. You have never explained a thesis when a reaction gif would do.',
    strengths: 'You bend attention like it owes you money.',
    weakness: 'It is hard to take profit when the bit is this good.',
    behavioralPattern: 'Ships the meme before the market opens.',
    observation: 'Your P&L and your engagement have never once agreed.',
    role: 'Meme Lord',
    signature: ['MEME', 'CHAOS', 'COMMUNITY', 'FOMO'],
  },
  {
    id: 'the-npc',
    title: 'THE NPC',
    description:
      'You wait for CT to decide, then you agree with it. This is not an insult, it is a survival strategy, and statistically it beats most of the geniuses above you.',
    strengths: 'You rarely blow up, because you rarely lead.',
    weakness: 'You have never had an opinion before the timeline handed you one.',
    behavioralPattern: 'Retweets the consensus, waits for the next one.',
    observation: 'Following the crowd has quietly outperformed your entire feed.',
    role: 'Observer',
    signature: ['FOMO', 'COMMUNITY', 'LOYALTY', 'MEME'],
  },
  {
    id: 'risk-enjoyer',
    title: 'THE RISK ENJOYER',
    description:
      'Leverage is not a tool to you, it is a lifestyle. You are calm at position sizes that would put a normal person in the hospital. The liquidation price is just a vibe.',
    strengths: 'Nerves of absolute steel and a stomach made of concrete.',
    weakness: 'You treat "risk of ruin" as a rounding error.',
    behavioralPattern: 'Adds margin when the screen turns red.',
    observation: 'Your account is either a rocket or a crater. Never a hill.',
    role: 'Degen',
    signature: ['RISK', 'DEGEN', 'CHAOS', 'FOMO'],
  },
  {
    id: 'ride-or-die',
    title: 'THE RIDE-OR-DIE',
    description:
      'You picked your team and you are with them to the bitter, glorious end. Founders trust you, communities adopt you, and your bags could be zero and you would still be defending them at 2am.',
    strengths: 'Loyalty that turns a Discord into a movement.',
    weakness: 'You mistake stubbornness for conviction, sometimes fatally.',
    behavioralPattern: 'Rallies the troops long after the retreat was sounded.',
    observation: 'You would take an arrow for a project that muted you.',
    role: 'Community',
    signature: ['LOYALTY', 'COMMUNITY', 'CONVICTION', 'MEME'],
  },
  {
    id: 'gigabrain',
    title: 'THE GIGABRAIN',
    description:
      'You read the whitepaper, then the code, then the founder\'s citations, then you disagreed with all three. Everyone waits to see what you think, which is exactly why you say so little.',
    strengths: 'You connect dots nobody else can even see.',
    weakness: 'You overthink a coin flip into a research paper.',
    behavioralPattern: 'Ships a thesis with footnotes and a bibliography.',
    observation: 'You are right so early that being right stops being useful.',
    role: 'Researcher',
    signature: ['RESEARCHER', 'BUILDER', 'CONTRARIAN', 'CURIOSITY'],
  },
  {
    id: 'the-mercenary',
    title: 'THE MERCENARY',
    description:
      'No team, no flag, no feelings. You farm the airdrop, extract the yield, and rotate out before the community photo. Loyalty is a liability and you have shed it entirely.',
    strengths: 'Ruthless efficiency and zero emotional drawdown.',
    weakness: 'You have optimized your way out of ever being early to anything you love.',
    behavioralPattern: 'In for the incentive, out before the vesting.',
    observation: 'You have never held a bag one block longer than it paid you to.',
    role: 'Degen',
    signature: ['RISK', 'DEGEN', 'RESEARCHER', 'CONTRARIAN'],
  },
];

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

const SIGNATURE_WEIGHTS = [1, 0.72, 0.48, 0.28];

// Each type's "ideal" 12-dim vector, built once from its ranked signature.
const IDEALS: { p: Personality; vec: number[]; norm: number }[] = PERSONALITIES.map(
  (p) => {
    const vec = DIMENSIONS.map((d) => {
      const rank = p.signature.indexOf(d);
      return rank === -1 ? 0 : SIGNATURE_WEIGHTS[rank] ?? 0.18;
    });
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return { p, vec, norm };
  },
);

/**
 * Pick the archetype whose signature best matches the user's whole profile by
 * cosine similarity. Cosine (not a weighted sum) normalizes each type's vector,
 * so no single archetype can dominate — results spread across all 20 types as
 * answers vary. Deterministic per handle; ties break stably by hash.
 */
export function selectPersonality(scores: Scores, username: string): Personality {
  const salt = hashString(username);
  const user = DIMENSIONS.map((d) => scores[d] ?? 0);
  const userNorm = Math.sqrt(user.reduce((s, v) => s + v * v, 0)) || 1;

  let best = IDEALS[0].p;
  let bestScore = -Infinity;

  IDEALS.forEach(({ p, vec, norm }, idx) => {
    let dot = 0;
    for (let i = 0; i < vec.length; i++) dot += user[i] * vec[i];
    const cos = dot / (userNorm * norm);
    // Hairline deterministic jitter so exact ties resolve stably per handle.
    const tiebreak = (((salt >>> idx) & 0x3f) / 0x3f) * 0.01;
    const total = cos + tiebreak;
    if (total > bestScore) {
      bestScore = total;
      best = p;
    }
  });

  return best;
}

export interface AlignmentResult {
  label: Alignment;
  /** -1 (lawful) .. +1 (chaotic) */
  x: number;
  /** -1 (degen / npc) .. +1 (builder / researcher) */
  y: number;
}

export function computeAlignment(scores: Scores): AlignmentResult {
  // Horizontal: order vs chaos.
  const chaosScore = scores.CHAOS - (scores.CONVICTION + scores.RESEARCHER) / 2;
  const x = clamp(chaosScore / 60, -1, 1);

  // Vertical: structured (builder/researcher) vs impulsive (degen/npc energy).
  const structure =
    (scores.BUILDER + scores.RESEARCHER) / 2 - (scores.DEGEN + scores.FOMO) / 2;
  const y = clamp(structure / 60, -1, 1);

  const dominant = Math.max(
    scores.BUILDER,
    scores.RESEARCHER,
    scores.DEGEN,
  );
  const strongestType =
    dominant < 42
      ? 'NPC'
      : dominant === scores.BUILDER
        ? 'Builder'
        : dominant === scores.RESEARCHER
          ? 'Researcher'
          : 'Degen';

  const order: 'Lawful' | 'Neutral' | 'Chaotic' =
    x > 0.28 ? 'Chaotic' : x < -0.28 ? 'Lawful' : 'Neutral';

  let label: Alignment;
  switch (strongestType) {
    case 'Builder':
      label = order === 'Chaotic' ? 'Chaotic Builder' : 'Lawful Builder';
      break;
    case 'Researcher':
      label = order === 'Chaotic' ? 'Chaotic Researcher' : 'Lawful Researcher';
      break;
    case 'Degen':
      label = order === 'Chaotic' ? 'Chaotic Degen' : 'Neutral Degen';
      break;
    default:
      label = 'Neutral NPC';
  }

  return { label, x, y };
}

// --- Flavor lines keyed to the user's dominant dimension --------------------

const DANGEROUS_TRAITS: Partial<Record<Dimension, string[]>> = {
  DEGEN: [
    'You treat position sizing as an emotion, not a calculation.',
    'You have never once waited for the second candle.',
  ],
  CONVICTION: [
    'You cannot leave a narrative alone once it convinces you.',
    'You have mistaken being early for being right.',
  ],
  CHAOS: [
    'You make irreversible decisions during reversible moods.',
    'Your best and worst trades were the same trade.',
  ],
  RESEARCHER: [
    'You research a trade until the trade no longer exists.',
    'You think every obscure protocol deserves a 19-post thread.',
  ],
  FOMO: [
    'You buy other people\'s excitement at full retail price.',
    'A green candle can override your entire personality.',
  ],
  COMMUNITY: [
    'You will hold a bad bag to protect a good friendship.',
    'Loyalty to the group chat has cost you real money.',
  ],
  CONTRARIAN: [
    'You fade the crowd so hard you sometimes fade yourself.',
    'You have said no to a yes you are still thinking about.',
  ],
  MEME: [
    'You cannot take profit while the bit is still funny.',
    'You would rather be quoted than be right.',
  ],
  RISK: [
    'You size like the downside is a rumor.',
    'Your stop-loss is a suggestion you ignore.',
  ],
  BUILDER: [
    'You will grind on the thing long after it stops loving you back.',
    'You ship at 3am and apologize to no one, including yourself.',
  ],
  LOYALTY: [
    'You defend projects past the point of evidence.',
    'You will go down with a ship you no longer captain.',
  ],
  CURIOSITY: [
    'You open every door, including the ones marked do not open.',
    'You have 400 bookmarks and zero closed tabs.',
  ],
};

const SUPERPOWERS: Partial<Record<Dimension, string[]>> = {
  RESEARCHER: [
    'You actually read the documentation.',
    'You can spot a rug in the first two paragraphs.',
  ],
  CONTRARIAN: [
    'You can smell a narrative before it becomes mainstream.',
    'You are immune to the exact hype that ruins everyone else.',
  ],
  COMMUNITY: [
    'You turn random group chats into actual relationships.',
    'People trust you before they trust the project.',
  ],
  BUILDER: [
    'You turn a bad week into a shipped feature.',
    'You build the tool everyone else ends up speculating on.',
  ],
  CONVICTION: [
    'You hold through the winter that shakes everyone else out.',
    'Your certainty becomes other people\'s courage.',
  ],
  DEGEN: [
    'You act in the two seconds everyone else spends thinking.',
    'You have the entry filled before the thesis is written.',
  ],
  MEME: [
    'You can move attention with a single image.',
    'You speak the timeline\'s native language fluently.',
  ],
  CURIOSITY: [
    'You find the thing before it has a name.',
    'Your bookmarks are worth more than most funds.',
  ],
  FOMO: [
    'You are always in the room where it happens.',
    'Your radar for momentum is genuinely unfair.',
  ],
  RISK: [
    'You keep your head at the exact size that breaks everyone else.',
    'You are comfortable exactly where others panic.',
  ],
  LOYALTY: [
    'You are the person people want in the trench with them.',
    'You show up for projects long before they can pay you back.',
  ],
  CHAOS: [
    'You thrive in the volatility that paralyzes calmer people.',
    'You improvise your way out of situations plans cannot reach.',
  ],
};

const RED_FLAGS: Partial<Record<Dimension, string[]>> = {
  DEGEN: ['You have a wallet you are afraid to open in daylight.'],
  MEME: ['Your entire thesis has, at times, been a single reaction gif.'],
  FOMO: ['You have aped a coin before finishing the ticker.'],
  COMMUNITY: ['You have 6 group chats and an opinion in all of them.'],
  RESEARCHER: ['You once wrote more words about a coin than the team did.'],
  CONTRARIAN: ['You disagreed with a take just to see what would happen.'],
  CONVICTION: ['You have defended a bag in front of witnesses.'],
  CHAOS: ['Your best decisions and worst decisions look identical from outside.'],
  BUILDER: ['You have refactored something at 4am that nobody asked about.'],
  RISK: ['You call it "conviction," your bank calls it "concerning."'],
  LOYALTY: ['You still hold one thing purely out of spite and love.'],
  CURIOSITY: ['You have testnet tokens for chains that no longer exist.'],
};

function pickFrom(pool: string[] | undefined, salt: number, fallback: string): string {
  if (!pool || pool.length === 0) return fallback;
  // Guard against negative salts so the index never wraps to undefined.
  const idx = ((Math.trunc(salt) % pool.length) + pool.length) % pool.length;
  return pool[idx] ?? fallback;
}

export function buildFlavor(scores: Scores, username: string) {
  const ranked = rankDimensions(scores);
  const salt = hashString(username);
  const top = ranked[0].dimension;
  const second = ranked[1].dimension;
  const third = ranked[2].dimension;

  return {
    dangerousTrait: pickFrom(
      DANGEROUS_TRAITS[top],
      salt,
      'You commit to things with a speed that alarms your future self.',
    ),
    superpower: pickFrom(
      SUPERPOWERS[second] ?? SUPERPOWERS[top],
      salt >>> 3,
      'You see the shape of a move before the chart admits it.',
    ),
    redFlag: pickFrom(
      RED_FLAGS[third] ?? RED_FLAGS[top],
      salt >>> 6,
      'You have at least one wallet you refuse to talk about.',
    ),
  };
}
