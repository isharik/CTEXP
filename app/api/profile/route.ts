import { NextResponse } from 'next/server';
import { fallbackProfile } from '@/lib/fallback';
import { isValidUsername, normalizeUsername } from '@/lib/validation';
import type { ProfileFlavor } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Basic, best-effort in-memory rate limiting -----------------------------
// Serverless instances are ephemeral, so this is a courtesy limiter, not a
// hard guarantee. It stops trivial hammering from a single instance.
const WINDOW_MS = 60_000;
const MAX_HITS = 20;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'anon';
}

/**
 * Attempt to read *public* profile flavor without any API key or paid service.
 * This is intentionally conservative: on any failure, timeout, or unexpected
 * shape, we return null and the caller falls back. We never fabricate numbers.
 */
async function tryPublicProfile(username: string): Promise<ProfileFlavor | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    // Unauthenticated public syndication endpoint. Frequently unavailable —
    // that is expected and handled by the fallback path.
    const res = await fetch(
      `https://cdn.syndication.twimg.com/timeline/profile?screen_name=${encodeURIComponent(
        username,
      )}`,
      {
        signal: controller.signal,
        headers: { accept: 'application/json' },
        cache: 'no-store',
      },
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const user = extractUser(data);
    if (!user) return null;
    return {
      available: true,
      username,
      displayName: user.name,
      bio: user.description,
      followers: user.followers_count,
      following: user.friends_count,
      note: 'Public profile signal detected. Used for flavor only.',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch the public profile picture server-side and return it as a data URI.
 * Doing this on the server (not client) means the image is same-origin to the
 * page, so it can be drawn onto the share canvas without tainting it. Uses the
 * free, keyless unavatar resolver. `fallback=false` returns 404 when there is
 * no real avatar, so we never show a placeholder as if it were the user's.
 */
async function tryAvatar(username: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      `https://unavatar.io/x/${encodeURIComponent(username)}?fallback=false`,
      { signal: controller.signal, cache: 'no-store' },
    );
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/jpeg';
    if (!type.startsWith('image/')) return null;
    const buf = await res.arrayBuffer();
    // Guard against oversized payloads (avatars are small).
    if (buf.byteLength > 600_000) return null;
    const b64 = Buffer.from(buf).toString('base64');
    return `data:${type};base64,${b64}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

interface RawUser {
  name?: string;
  description?: string;
  followers_count?: number;
  friends_count?: number;
}

function extractUser(data: unknown): RawUser | null {
  if (!data || typeof data !== 'object') return null;
  // The syndication payload shape shifts; probe a couple of known spots safely.
  const anyData = data as Record<string, unknown>;
  const candidate =
    (anyData.user as RawUser) ||
    ((anyData.props as Record<string, unknown>)?.user as RawUser);
  if (candidate && typeof candidate === 'object' && 'name' in candidate) {
    return candidate;
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('u') ?? '';

  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: 'Slow down. Try again in a minute.' },
      { status: 429 },
    );
  }

  if (!isValidUsername(raw)) {
    return NextResponse.json(
      { error: 'Invalid handle.' },
      { status: 400 },
    );
  }

  const username = normalizeUsername(raw);

  // Fetch profile flavor and avatar in parallel; both fail gracefully.
  let profile: ProfileFlavor | null = null;
  let avatar: string | null = null;
  try {
    [profile, avatar] = await Promise.all([
      tryPublicProfile(username).catch(() => null),
      tryAvatar(username).catch(() => null),
    ]);
  } catch {
    profile = null;
  }

  const base = profile ?? fallbackProfile(username);
  if (avatar) base.avatar = avatar;

  return NextResponse.json(base, {
    status: 200,
    headers: { 'cache-control': 'no-store' },
  });
}
