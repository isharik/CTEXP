'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Kinetic grid background — a warping node/line lattice that bends toward the
 * cursor and ripples on click. Adapted to the CT Human Experiment palette
 * (void black base, signal-red activation, restrained white).
 *
 * Perf notes (this runs on every page, continuously, so it sets the floor for
 * how the whole app feels):
 * - The dot texture is baked once into a CanvasPattern and blitted with a
 *   single fillRect, instead of thousands of individual arc() calls a frame.
 * - Grid lines and nodes are batched into a handful of Path2D objects
 *   (bucketed by proximity) so each frame does ~10 stroke/fill calls instead
 *   of ~1800 individual draw calls with a state change on every one.
 * - No per-node CanvasGradient is created — those are one of the more
 *   expensive canvas ops and were being allocated for every "active" node,
 *   every frame. Glow is now a flat low-alpha circle, batched the same way.
 * - Device pixel ratio is capped lower and the cell size is larger, both of
 *   which cut the raw amount of drawing work regardless of the above.
 * - The draw pass itself is capped to ~45fps; pointer easing still runs every
 *   rAF so tracking stays smooth, only the (expensive) redraw is throttled.
 */

interface Point {
  x: number;
  y: number;
}
interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

const CELL_SIZE = 100;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 30;
const LERP_SPEED = 0.09;
const MAX_DPR = 1.5;
const FRAME_INTERVAL = 1000 / 45; // cap the (expensive) draw pass, not input tracking

const NODE_BASE_RADIUS = 1.6;
const NODE_ACTIVE_RADIUS = 3.2;
const BUCKETS = 5;

// CT palette
const BG = '#080809';
const LINE_BASE = { r: 233, g: 233, b: 228, a: 0.08 }; // faint bone
const LINE_ACTIVE = { r: 229, g: 72, b: 77, a: 0.92 }; // signal red
const NODE_BASE = { r: 233, g: 233, b: 228, a: 0.16 };
const NODE_ACTIVE = { r: 255, g: 138, b: 141, a: 1 };
const GLOW = '229,72,77';
const RIPPLE = '229,72,77';

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(
  base: { r: number; g: number; b: number; a: number },
  active: { r: number; g: number; b: number; a: number },
  t: number,
): string {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}
function bucketOf(t: number) {
  return Math.min(BUCKETS - 1, Math.floor(t * BUCKETS));
}

export default function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const dotPatternRef = useRef<CanvasPattern | null>(null);
  const lastDrawRef = useRef(0);

  const getWarpedPoint = useCallback(
    (
      gx: number,
      gy: number,
      col: number,
      row: number,
      mouse: Point,
      ripples: Ripple[],
      cols: number,
      rows: number,
    ): { pt: Point; proximity: number } => {
      const edgeMargin = 1.5;
      const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
      const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
      const pinFactor = colPin * colPin * rowPin * rowPin;

      const dx = gx - mouse.x;
      const dy = gy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

      let rx = 0;
      let ry = 0;
      for (const r of ripples) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 55;
        const diff = rdist - r.radius;
        if (Math.abs(diff) < waveWidth) {
          const strength =
            (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pinFactor;
          const angle = Math.atan2(rdy, rdx);
          const sign = diff < 0 ? -1 : 1;
          rx += Math.cos(angle) * strength * sign * -1;
          ry += Math.sin(angle) * strength * sign * -1;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const warpAmt = eased * MAX_WARP * pinFactor;
        const angle = Math.atan2(dy, dx);
        return {
          pt: {
            x: gx - Math.cos(angle) * warpAmt + rx,
            y: gy - Math.sin(angle) * warpAmt + ry,
          },
          proximity,
        };
      }
      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    [],
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { w: W, h: H } = sizeRef.current;
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Static dot texture — one fillRect via a cached tiled pattern instead
      // of thousands of individual arcs.
      if (dotPatternRef.current) {
        ctx.fillStyle = dotPatternRef.current;
        ctx.fillRect(0, 0, W, H);
      }

      // Advance ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 420);
        r.opacity = Math.max(0, 1 - age * 1.2);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
      const cellW = W / (cols - 1);
      const cellH = H / (rows - 1);

      const pts: Point[][] = [];
      const prox: number[][] = [];
      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = getWarpedPoint(
            col * cellW,
            row * cellH,
            col,
            row,
            mouse,
            ripples,
            cols,
            rows,
          );
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      // Batch every line segment into one Path2D per proximity bucket, so the
      // whole grid draws with a handful of stroke() calls instead of one per
      // segment (each of which used to also force a strokeStyle change).
      const linePaths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const addSeg = (p1: Point, p2: Point, pr1: number, pr2: number) => {
        const t = smoothstep((pr1 + pr2) / 2);
        const path = linePaths[bucketOf(t)];
        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
      };
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          addSeg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);
      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          addSeg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

      ctx.lineCap = 'butt';
      for (let b = 0; b < BUCKETS; b++) {
        const t = b / (BUCKETS - 1);
        ctx.strokeStyle = lerpColor(LINE_BASE, LINE_ACTIVE, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke(linePaths[b]);
      }

      // Same batching for nodes, plus a flat (non-gradient) glow pass for the
      // handful of nodes near the cursor.
      const nodePaths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const glowPath = new Path2D();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const t = smoothstep(prox[row][col]);
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);
          nodePaths[bucketOf(t)].arc(p.x, p.y, r, 0, Math.PI * 2);
          if (t > 0.3) {
            const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
            glowPath.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          }
        }
      }

      ctx.fillStyle = `rgba(${GLOW},0.10)`;
      ctx.fill(glowPath);
      for (let b = 0; b < BUCKETS; b++) {
        const t = b / (BUCKETS - 1);
        ctx.fillStyle = lerpColor(NODE_BASE, NODE_ACTIVE, t);
        ctx.fill(nodePaths[b]);
      }

      for (const r of ripples) {
        const safeRadius = Math.max(0, r.radius);
        ctx.beginPath();
        ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RIPPLE},${(r.opacity * 0.3).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [getWarpedPoint],
  );

  const animate = useCallback(
    (now: number) => {
      const m = mouseRef.current;
      const t = targetMouseRef.current;
      m.x = lerpN(m.x, t.x, LERP_SPEED);
      m.y = lerpN(m.y, t.y, LERP_SPEED);

      if (now - lastDrawRef.current >= FRAME_INTERVAL) {
        draw(now);
        lastDrawRef.current = now;
      }
      rafRef.current = requestAnimationFrame(animate);
    },
    [draw],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const buildDotPattern = () => {
      if (!ctx) return;
      const tile = document.createElement('canvas');
      tile.width = DOT_SPACING;
      tile.height = DOT_SPACING;
      const tctx = tile.getContext('2d');
      if (!tctx) return;
      tctx.fillStyle = 'rgba(233,233,228,0.05)';
      tctx.beginPath();
      tctx.arc(DOT_SPACING / 2, DOT_SPACING / 2, 0.8, 0, Math.PI * 2);
      tctx.fill();
      dotPatternRef.current = ctx.createPattern(tile, 'repeat');
    };

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // Draw in CSS pixels; the backing store is DPR-scaled for crispness.
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      buildDotPattern();
    };

    setSize();
    const onResize = () => setSize();
    const onMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
