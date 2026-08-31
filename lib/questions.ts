import { hashString } from './scoring';
import type { Question } from './types';

/**
 * A pool of scenarios. Each session is served a per-handle subset (see
 * selectQuestions), so most people answer a different set in a different order —
 * while any given handle always gets the same set, keeping results shareable
 * and reproducible from the URL.
 *
 * Each choice quietly moves several hidden dimensions.
 */
export const QUESTION_POOL: Question[] = [
  {
    id: 1,
    tag: 'STIMULUS',
    prompt: 'Your favorite protocol announces a token tomorrow.',
    choices: [
      { key: 'A', label: 'Sell everything before the announcement.', weights: { CONTRARIAN: 3, CHAOS: 2, CONVICTION: 1, LOYALTY: -1 } },
      { key: 'B', label: "Post 'wen token?' like it's still funny.", weights: { MEME: 3, COMMUNITY: 2, FOMO: 1 } },
      { key: 'C', label: 'Actually read the docs first.', weights: { RESEARCHER: 3, BUILDER: 1, CURIOSITY: 2 } },
      { key: 'D', label: 'Already have 17 wallets warmed up.', weights: { DEGEN: 3, RISK: 2, FOMO: 1, CHAOS: 1 } },
      { key: 'E', label: 'Wait for CT to tell me how to feel about it.', weights: { COMMUNITY: 2, FOMO: 2, CONVICTION: -2 } },
    ],
  },
  {
    id: 2,
    tag: 'PRESSURE TEST',
    prompt: 'You wake up and the portfolio is down 74%.',
    choices: [
      { key: 'A', label: 'Buy the dip. This is a gift, actually.', weights: { CONVICTION: 3, DEGEN: 2, RISK: 2 } },
      { key: 'B', label: 'Delete the app and go touch a tree.', weights: { CHAOS: 2, CONVICTION: -1, LOYALTY: -1 } },
      { key: 'C', label: "Post 'zoom out' at nobody in particular.", weights: { MEME: 2, COMMUNITY: 2, CONVICTION: 1 } },
      { key: 'D', label: 'Open a spreadsheet and find out what broke.', weights: { RESEARCHER: 3, CURIOSITY: 2, BUILDER: 1 } },
      { key: 'E', label: 'Check if everyone else is bleeding too.', weights: { COMMUNITY: 2, FOMO: 1, CONVICTION: -1 } },
    ],
  },
  {
    id: 3,
    tag: 'SOCIAL INPUT',
    prompt: 'A project founder follows you out of nowhere.',
    choices: [
      { key: 'A', label: 'Screenshot it and post immediately.', weights: { COMMUNITY: 2, MEME: 2, FOMO: 2 } },
      { key: 'B', label: 'Follow back, say nothing, feel something.', weights: { LOYALTY: 2, COMMUNITY: 1, RESEARCHER: -1 } },
      { key: 'C', label: 'Do absolutely nothing.', weights: { CONTRARIAN: 2, CONVICTION: 2, COMMUNITY: -1 } },
      { key: 'D', label: 'Go read every commit they ever pushed.', weights: { RESEARCHER: 3, CURIOSITY: 2, BUILDER: 1 } },
      { key: 'E', label: 'Slide into the DMs with a pitch.', weights: { DEGEN: 2, RISK: 2, COMMUNITY: 1 } },
    ],
  },
  {
    id: 4,
    tag: 'ALLOCATION',
    prompt: 'You have $10,000 and it must go into exactly one box.',
    sub: 'No hedging. No splitting. Choose.',
    choices: [
      { key: 'A', label: 'AI — the narrative prints itself.', weights: { FOMO: 2, RISK: 2, CONTRARIAN: -1, CONVICTION: 1 } },
      { key: 'B', label: 'BTC — boring on purpose.', weights: { CONVICTION: 3, RESEARCHER: 1, DEGEN: -2, RISK: -1 } },
      { key: 'C', label: 'DeFi — I want the yield and the risk.', weights: { BUILDER: 2, RESEARCHER: 2, RISK: 1 } },
      { key: 'D', label: 'Memecoin — a dog told me to.', weights: { DEGEN: 3, MEME: 3, RISK: 3, CHAOS: 2 } },
      { key: 'E', label: 'Stablecoins — I have seen things.', weights: { CONVICTION: 1, RESEARCHER: 1, RISK: -3, DEGEN: -2 } },
    ],
  },
  {
    id: 5,
    tag: 'BANDWIDTH',
    prompt: 'A friend drops a 47-post thread.',
    choices: [
      { key: 'A', label: 'Read all 47. Take notes.', weights: { RESEARCHER: 3, LOYALTY: 2, CURIOSITY: 2 } },
      { key: 'B', label: 'Like the first post, absorb the vibe.', weights: { COMMUNITY: 1, FOMO: 1, RESEARCHER: -1 } },
      { key: 'C', label: "Reply 'gm' and keep it moving.", weights: { MEME: 3, COMMUNITY: 2 } },
      { key: 'D', label: 'Bookmark it. (You will never return.)', weights: { CURIOSITY: 2, CHAOS: 1, BUILDER: -1 } },
      { key: 'E', label: 'Feed it to an AI and read the summary.', weights: { BUILDER: 2, RESEARCHER: 1, CONTRARIAN: 1, LOYALTY: -1 } },
    ],
  },
  {
    id: 6,
    tag: 'CONFLICT',
    prompt: 'Someone is confidently, loudly wrong in your replies.',
    choices: [
      { key: 'A', label: 'Quote-tweet them into the sun.', weights: { CONTRARIAN: 3, CHAOS: 2, MEME: 2 } },
      { key: 'B', label: 'Write the calm, sourced correction.', weights: { RESEARCHER: 3, BUILDER: 1, CONVICTION: 2 } },
      { key: 'C', label: 'Mute, block, dissolve the tension.', weights: { CONVICTION: 1, COMMUNITY: -1, CHAOS: -2 } },
      { key: 'D', label: 'Log off and let CT handle it.', weights: { COMMUNITY: 1, CONVICTION: -1, CHAOS: -1 } },
      { key: 'E', label: 'Agree with them. Chaos is funnier.', weights: { CHAOS: 3, MEME: 2, CONVICTION: -2 } },
    ],
  },
  {
    id: 7,
    tag: 'GROUP SIGNAL',
    prompt: 'The group chat is aping a coin you have never heard of.',
    choices: [
      { key: 'A', label: 'In before I finish reading the ticker.', weights: { FOMO: 3, DEGEN: 3, RISK: 3, CHAOS: 1 } },
      { key: 'B', label: 'Ask three questions, get zero answers, ape anyway.', weights: { FOMO: 2, DEGEN: 2, RESEARCHER: 1, CHAOS: 1 } },
      { key: 'C', label: 'Watch the chart, miss the entry, cope.', weights: { FOMO: 1, CONVICTION: -1, RESEARCHER: 1 } },
      { key: 'D', label: 'Pull the contract and check the holders first.', weights: { RESEARCHER: 3, CURIOSITY: 2, RISK: -1, DEGEN: -1 } },
      { key: 'E', label: 'Refuse on principle. You are not a sheep.', weights: { CONTRARIAN: 3, CONVICTION: 2, FOMO: -2 } },
    ],
  },
  {
    id: 8,
    tag: 'INFORMATION',
    prompt: 'You find genuine alpha before anyone else does.',
    choices: [
      { key: 'A', label: 'Post it. Being first is the whole reward.', weights: { COMMUNITY: 2, MEME: 1, CONTRARIAN: -1, FOMO: 1 } },
      { key: 'B', label: 'Tell the group chat only. Loyalty tax.', weights: { LOYALTY: 3, COMMUNITY: 2, CONVICTION: 1 } },
      { key: 'C', label: 'Size in quietly, say nothing.', weights: { DEGEN: 2, CONVICTION: 2, RISK: 2, CONTRARIAN: 1 } },
      { key: 'D', label: 'Verify it for a week before you trust it.', weights: { RESEARCHER: 3, CURIOSITY: 2, CONVICTION: 1 } },
      { key: 'E', label: 'Build a tool around it instead of trading it.', weights: { BUILDER: 3, RESEARCHER: 1, CURIOSITY: 2 } },
    ],
  },
  {
    id: 9,
    tag: 'FALLOUT',
    prompt: 'A project you publicly championed quietly dies.',
    choices: [
      { key: 'A', label: 'Own it. Post the post-mortem thread.', weights: { BUILDER: 2, CONVICTION: 2, RESEARCHER: 2, LOYALTY: 1 } },
      { key: 'B', label: 'Delete the old tweets. What tweets?', weights: { CHAOS: 2, CONVICTION: -2, LOYALTY: -1 } },
      { key: 'C', label: 'Stay loyal, defend it to the last replier.', weights: { LOYALTY: 3, CONVICTION: 2, CONTRARIAN: 1 } },
      { key: 'D', label: 'Turn the whole thing into a bit.', weights: { MEME: 3, CHAOS: 2, COMMUNITY: 1 } },
      { key: 'E', label: 'Move on. Next narrative already loading.', weights: { FOMO: 2, DEGEN: 1, LOYALTY: -2 } },
    ],
  },
  {
    id: 10,
    tag: 'BASELINE',
    prompt: 'Honest question: how do you actually show up here?',
    choices: [
      { key: 'A', label: 'I post through everything. Silence is death.', weights: { COMMUNITY: 3, MEME: 2, CHAOS: 1 } },
      { key: 'B', label: 'I lurk. I see all. I say nothing.', weights: { RESEARCHER: 2, CURIOSITY: 2, COMMUNITY: -2, CONTRARIAN: 1 } },
      { key: 'C', label: 'I ship in public and let the work talk.', weights: { BUILDER: 3, CONVICTION: 2, RESEARCHER: 1 } },
      { key: 'D', label: 'I live in the replies. All of them.', weights: { COMMUNITY: 2, CONTRARIAN: 2, MEME: 1, CHAOS: 1 } },
      { key: 'E', label: 'I appear only when there is money to be made.', weights: { DEGEN: 3, FOMO: 2, RISK: 2, COMMUNITY: -1 } },
    ],
  },
  {
    id: 11,
    tag: 'RITUAL',
    prompt: "It's 7am. Your first move on the timeline is:",
    choices: [
      { key: 'A', label: "Post 'gm' to 4,000 people who won't reply.", weights: { COMMUNITY: 3, MEME: 2, LOYALTY: 1 } },
      { key: 'B', label: 'Check the charts before your own name.', weights: { DEGEN: 2, FOMO: 2, RISK: 1 } },
      { key: 'C', label: 'Read what broke overnight in three ecosystems.', weights: { RESEARCHER: 3, CURIOSITY: 2 } },
      { key: 'D', label: 'Nothing. Mornings are for lurking.', weights: { CURIOSITY: 1, COMMUNITY: -2, CONTRARIAN: 1 } },
      { key: 'E', label: 'Open the repo. gm is a distraction.', weights: { BUILDER: 3, CONVICTION: 1 } },
    ],
  },
  {
    id: 12,
    tag: 'TEMPTATION',
    prompt: 'A coin you sold pumps 8x the week after you exit.',
    choices: [
      { key: 'A', label: 'Buy it back higher. It clearly wants me.', weights: { FOMO: 3, DEGEN: 2, RISK: 2, CHAOS: 1 } },
      { key: 'B', label: 'Post about how you were "basically early."', weights: { MEME: 2, COMMUNITY: 2, CONVICTION: -1 } },
      { key: 'C', label: 'Sit in silence. Never speak of it.', weights: { CONVICTION: 2, CONTRARIAN: 1, COMMUNITY: -1 } },
      { key: 'D', label: 'Study why you sold and write the lesson down.', weights: { RESEARCHER: 3, BUILDER: 1, CURIOSITY: 1 } },
      { key: 'E', label: 'Genuinely happy for the holders. Weirdly.', weights: { LOYALTY: 2, COMMUNITY: 2, DEGEN: -1 } },
    ],
  },
  {
    id: 13,
    tag: 'ENDORSEMENT',
    prompt: 'A big account shills the exact bag you already hold.',
    choices: [
      { key: 'A', label: 'Finally. Validation. Add more.', weights: { FOMO: 2, CONVICTION: 1, COMMUNITY: 1 } },
      { key: 'B', label: 'Uh oh. Start planning the exit.', weights: { CONTRARIAN: 3, RESEARCHER: 2, RISK: -1 } },
      { key: 'C', label: 'Quote them with your original thesis, timestamped.', weights: { CONVICTION: 2, MEME: 1, BUILDER: 1 } },
      { key: 'D', label: 'Check who paid them before you react.', weights: { RESEARCHER: 3, CURIOSITY: 2, CONTRARIAN: 1 } },
      { key: 'E', label: 'Ride the wave, sell into their audience.', weights: { DEGEN: 3, RISK: 2, LOYALTY: -1 } },
    ],
  },
  {
    id: 14,
    tag: 'GRIND',
    prompt: 'A new chain launches an airdrop farming season.',
    choices: [
      { key: 'A', label: 'Spin up 40 wallets and a spreadsheet.', weights: { DEGEN: 2, BUILDER: 2, RESEARCHER: 2, RISK: 1 } },
      { key: 'B', label: 'Do the bare minimum on your main and hope.', weights: { FOMO: 2, COMMUNITY: 1, CHAOS: 1 } },
      { key: 'C', label: 'Ignore it. Farming is a job you did not apply for.', weights: { CONTRARIAN: 2, CONVICTION: 2, DEGEN: -2 } },
      { key: 'D', label: 'Automate it and forget it exists.', weights: { BUILDER: 3, RESEARCHER: 1, CURIOSITY: 1 } },
      { key: 'E', label: 'Wait for the guide, then rush it at the deadline.', weights: { FOMO: 3, COMMUNITY: 1, RESEARCHER: -1 } },
    ],
  },
  {
    id: 15,
    tag: 'EXIT',
    prompt: 'Your bag is finally, genuinely, up big. Now what?',
    choices: [
      { key: 'A', label: 'Take profit like an adult. Some of it.', weights: { RESEARCHER: 2, CONVICTION: 2, RISK: -1 } },
      { key: 'B', label: 'Nothing. Diamond hands or death.', weights: { CONVICTION: 3, RISK: 3, LOYALTY: 2 } },
      { key: 'C', label: 'Roll it all into the next rotation.', weights: { DEGEN: 3, FOMO: 2, RISK: 2, CHAOS: 1 } },
      { key: 'D', label: 'Post the gain, then panic-sell an hour later.', weights: { CHAOS: 3, MEME: 1, CONVICTION: -1 } },
      { key: 'E', label: 'Quietly move some to cold storage and shut up.', weights: { RESEARCHER: 2, CONVICTION: 1, COMMUNITY: -1 } },
    ],
  },
  {
    id: 16,
    tag: 'IDENTITY',
    prompt: 'Your profile picture is a decision. What is it?',
    choices: [
      { key: 'A', label: 'A blue-chip NFT I definitely still own.', weights: { COMMUNITY: 2, CONVICTION: 1, RISK: 1 } },
      { key: 'B', label: 'An anime character nobody has placed.', weights: { MEME: 3, CHAOS: 2, CONTRARIAN: 1 } },
      { key: 'C', label: 'My actual face. I have nothing to hide. Mostly.', weights: { BUILDER: 2, CONVICTION: 2, COMMUNITY: 1 } },
      { key: 'D', label: 'Default egg energy. I am here to observe.', weights: { CURIOSITY: 2, COMMUNITY: -2, CONTRARIAN: 2 } },
      { key: 'E', label: 'Whatever the current meta pfp is.', weights: { FOMO: 3, COMMUNITY: 1, CONVICTION: -1 } },
    ],
  },
  {
    id: 17,
    tag: 'COPE',
    prompt: 'Deep in the bear market, someone asks if it\'s over.',
    choices: [
      { key: 'A', label: '"We are so early." (You have said this for years.)', weights: { CONVICTION: 3, FOMO: 1, LOYALTY: 2 } },
      { key: 'B', label: '"It was over the whole time." Doom posting.', weights: { CONTRARIAN: 2, CHAOS: 2, CONVICTION: -1 } },
      { key: 'C', label: 'Keep building. The cycle is background noise.', weights: { BUILDER: 3, CONVICTION: 2, RESEARCHER: 1 } },
      { key: 'D', label: 'Make a bear-market meme. Cope through comedy.', weights: { MEME: 3, COMMUNITY: 2, CHAOS: 1 } },
      { key: 'E', label: 'Quietly accumulate and tell no one.', weights: { RESEARCHER: 2, CONVICTION: 2, CONTRARIAN: 1 } },
    ],
  },
  {
    id: 18,
    tag: 'SECURITY',
    prompt: 'A slick site asks you to "verify wallet to claim."',
    choices: [
      { key: 'A', label: 'Read the URL character by character first.', weights: { RESEARCHER: 3, CONVICTION: 1, RISK: -2 } },
      { key: 'B', label: 'Connect a burner and see what happens.', weights: { DEGEN: 2, CURIOSITY: 3, RISK: 2, CHAOS: 1 } },
      { key: 'C', label: 'Post a warning to protect the timeline.', weights: { COMMUNITY: 3, LOYALTY: 2, BUILDER: 1 } },
      { key: 'D', label: 'Close the tab. Claims are a love language of scammers.', weights: { CONTRARIAN: 2, CONVICTION: 2, RISK: -2 } },
      { key: 'E', label: 'Ask the group chat if it\'s legit, then ape.', weights: { FOMO: 2, COMMUNITY: 1, RISK: 2 } },
    ],
  },
];

/** Number of scenarios each subject is asked. */
export const ASKED_COUNT = 10;
/** Back-compat alias used across the app for the length of a run. */
export const QUESTION_COUNT = ASKED_COUNT;

// Small, fast seeded PRNG so a handle always draws the same set.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic per-handle question set: a seeded Fisher-Yates shuffle of the
 * pool, sliced to ASKED_COUNT. Same handle → same set & order (so results stay
 * reproducible); different handles → mostly different sets.
 */
export function selectQuestions(username: string, count = ASKED_COUNT): Question[] {
  const rng = mulberry32(hashString(username.toLowerCase()) || 1);
  const pool = [...QUESTION_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/** Small deadpan reactions shown after each answer. */
export const REACTIONS = [
  'Noted.',
  'Interesting.',
  'That tells us something.',
  'Concerning.',
  'Expected.',
  'Very CT.',
  'Hm.',
  'Logged.',
  'We were afraid of that.',
  'The data agrees.',
] as const;
