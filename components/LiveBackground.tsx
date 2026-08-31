/**
 * Aura Background — a soft, masked glow field behind all content.
 *
 * Replaces the earlier interactive kinetic-grid canvas. This version runs no
 * JavaScript at all after mount: it's two elements whose background (a set
 * of soft radial gradients) is painted once, then only `transform` is
 * animated via CSS keyframes (see .aura-field / .aura-layer in globals.css).
 * The browser handles that entirely on the compositor thread — no canvas, no
 * requestAnimationFrame loop, no event listeners, nothing repainted per
 * frame — so it stays smooth on effectively any device. It doesn't need to
 * be a client component since it holds no state and touches no browser APIs.
 */
export default function LiveBackground() {
  return (
    <div aria-hidden className="aura-field">
      <div className="aura-layer aura-layer--a" />
      <div className="aura-layer aura-layer--b" />
    </div>
  );
}
