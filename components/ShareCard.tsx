'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import type { Result } from '@/lib/types';

export default function ShareCard({
  result,
  shareUrl,
  avatar,
}: {
  result: Result;
  shareUrl: string;
  avatar?: string;
}) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | 'share' | 'download'>(null);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const top3 = result.headline.slice(0, 3);
  const tweet = sarcasticTweet(result);

  // Rasterize the exact card node the user is looking at — the download and
  // the dashboard are one and the same image. Rendered at 2x for crispness.
  async function toBlob(): Promise<Blob | null> {
    const node = cardRef.current;
    if (!node) return null;
    const opts = { pixelRatio: 2, backgroundColor: '#0b0b0d' as const };
    // First pass can miss late-loading fonts/images; a second pass is reliable.
    // toPng is more robust than toBlob across browsers; convert to a Blob after.
    try {
      await toPng(node, opts);
      const dataUrl = await toPng(node, opts);
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (e) {
      console.error('card export failed', e);
      return null;
    }
  }

  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweet,
  )}&url=${encodeURIComponent(shareUrl)}`;

  async function onShare() {
    if (busy) return;
    setBusy('share');
    try {
      const blob = await toBlob();
      const file = blob
        ? new File([blob], `ct-human-${result.username}.png`, { type: 'image/png' })
        : null;

      // Mobile: the native share sheet can carry the card image + text together.
      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
      };
      if (file && nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], text: tweet, url: shareUrl });
          return;
        } catch {
          // user dismissed the sheet — fall through to the X composer
        }
      }

      // Desktop: put the card on the clipboard so it can be pasted straight
      // into the tweet, then open X with the post prefilled.
      let clipped = false;
      if (blob && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          clipped = true;
        } catch {
          /* clipboard image write not permitted */
        }
      }

      window.open(intentUrl, '_blank', 'noopener,noreferrer');

      if (clipped) {
        setHint('X is open with your post — paste the card with Ctrl / ⌘ + V');
      } else {
        // Couldn't reach the clipboard — hand them the file instead.
        if (blob) downloadBlob(blob, `ct-human-${result.username}.png`);
        setHint('X is open with your post — attach the card we just saved for you');
      }
      setTimeout(() => setHint(null), 6000);
    } catch {
      window.open(intentUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    if (busy) return;
    setBusy('download');
    try {
      const blob = await toBlob();
      if (blob) downloadBlob(blob, `ct-human-${result.username}.png`);
    } finally {
      setBusy(null);
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="lab-label text-faint">CLASSIFIED FILE</span>
        <span className="h-px flex-1 bg-line" />
        <span className="lab-label text-faint">FOR RELEASE</span>
      </div>

      {/* On-screen report card — this exact node is what gets exported */}
      <div
        ref={cardRef}
        className="relative overflow-hidden border border-line bg-gradient-to-b from-panel to-ink"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,#fff_3px,transparent_4px)]" />
        <div className="relative p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="lab-label text-signal">● CLASSIFIED</span>
            <span className="lab-label text-faint">FILE {fileNo(result.username)}</span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="h-16 w-16 flex-none rounded-full border border-line object-cover shadow-[0_0_24px_rgba(229,72,77,0.18)]"
              />
            ) : (
              <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full border border-line bg-panel font-display text-2xl font-bold text-faint">
                {result.username.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="lab-label text-faint">THE CT HUMAN EXPERIMENT</p>
              <p className="mt-1 font-mono text-xl leading-none text-bone">
                @{result.username}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="lab-label text-faint">SUBJECT TYPE</p>
            <p className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight text-bone sm:text-3xl">
              {result.personality.title}
            </p>
            <p className="mt-1 font-mono text-[12px] text-signal">
              {result.alignment} · {result.role}
            </p>
          </div>

          {/* mini meters */}
          <div className="mt-6 space-y-2.5">
            {top3.map((m) => (
              <div key={m.dimension} className="flex items-center gap-3">
                <span className="w-24 flex-none font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
                  {m.dimension}
                </span>
                <span className="h-[6px] flex-1 overflow-hidden bg-line">
                  <span
                    className="block h-full bg-bone"
                    style={{ width: `${m.value}%` }}
                  />
                </span>
                <span className="numeral w-7 flex-none text-right font-mono text-[12px] text-bone">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <p className="lab-label text-growth">SECRET SUPERPOWER</p>
              <p className="mt-1.5 text-[13px] leading-snug text-bone/90">
                {result.superpower}
              </p>
            </div>
            <div>
              <p className="lab-label text-signal">MOST DANGEROUS TRAIT</p>
              <p className="mt-1.5 text-[13px] leading-snug text-bone/90">
                {result.dangerousTrait}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <span className="lab-label text-faint">CT · HUMAN · EXPERIMENT</span>
            <span className="rotate-[-4deg] border border-signal/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-signal/80">
              Specimen Filed
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <button
          onClick={onShare}
          disabled={!!busy}
          className="btn-lab border border-bone/80 bg-bone px-4 py-3.5 text-[12px] text-void hover:bg-white disabled:opacity-60"
        >
          {busy === 'share' ? 'PREPARING…' : 'SHARE RESULT'}
        </button>
        <button
          onClick={onDownload}
          disabled={!!busy}
          className="btn-lab border border-line bg-panel px-4 py-3.5 text-[12px] text-bone hover:border-bone/40 hover:bg-raised disabled:opacity-60"
        >
          {busy === 'download' ? 'RENDERING…' : 'DOWNLOAD CARD'}
        </button>
        <button
          onClick={() => router.push('/')}
          className="btn-lab border border-line bg-panel px-4 py-3.5 text-[12px] text-ash hover:border-bone/40 hover:text-bone"
        >
          RUN AGAIN
        </button>
      </div>

      <div className="mt-3 flex min-h-[16px] items-center gap-3">
        <button
          onClick={onCopy}
          className="font-mono text-[11px] text-faint underline-offset-4 hover:text-ash hover:underline"
        >
          {copied ? 'LINK COPIED' : 'or copy result link'}
        </button>
        {hint && (
          <span className="font-mono text-[11px] text-growth">{hint}</span>
        )}
      </div>
    </div>
  );
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A short, sarcastic, personality-flavored post for X. Deterministic per run. */
function sarcasticTweet(result: Result): string {
  const type = titleCase(result.personality.title); // e.g. "The Professional Degen"
  const templates = [
    `Ran the CT Human Experiment so you didn't have to. Verdict: ${type}. Rude. Accurate. Unforgivable. Bet you can't handle yours 👇`,
    `The CT Human Experiment scanned me and went "${type}" 💀 never been so seen and so attacked at once. your turn, coward:`,
    `Diagnosis: ${type}. I'd argue but the data pulled receipts. get judged before you judge me 👇`,
    `apparently I'm ${type}. the timeline has been studied. now let it study you 🧪`,
    `${type}. that's it. that's the diagnosis. do the CT Human Experiment and suffer with me:`,
    `10 questions later and the CT Human Experiment declared me ${type}. therapy is cheaper. find out what you are 👇`,
  ];
  const idx = hashCode(result.username + result.personality.id) % templates.length;
  return templates[idx];
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileNo(username: string): string {
  let h = 0;
  for (const c of username) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return `#${h.toString().padStart(5, '0')}`;
}
