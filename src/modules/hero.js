import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SequencePainter } from './sequence.js';


/** progress through the sequence at which the bar actually snaps */
const SNAP = 0.36;

export function initHero(frames) {
  const section = document.querySelector('.hero');
  const canvas = document.getElementById('heroCanvas');
  if (!section || !canvas) return;

  const painter = new SequencePainter(canvas, frames);

  // Size the bar to the viewport rather than letting `contain` shrink it on
  // tall/narrow screens, where the artwork would otherwise sit in a stamp.
  // The bar fills ~91% of its frame, so the box runs a little wider than the
  // silhouette you actually see.
  const fitBar = () => {
    painter.resize();
    const img = frames.find((f) => f && f.naturalWidth);
    if (!img) return;
    const { cssW, cssH } = painter;
    const contain = Math.min(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const narrow = cssW < 760;
    const targetW = Math.min(cssW * (narrow ? 1.02 : 0.62), cssH * (narrow ? 1.2 : 1.06));
    painter.setTransform({
      scale: targetW / (img.naturalWidth * contain),
      // nudged down-right so the wordmark clears it and the bottom-left copy
      // never collides with the lower half of the bar
      offsetX: narrow ? 0 : 0.07,
      offsetY: narrow ? 0.02 : 0.05
    });
  };
  fitBar();
  painter.setProgress(0);

  ScrollTrigger.addEventListener('refreshInit', fitBar);
  window.addEventListener('resize', () => ScrollTrigger.refresh());

  const seq = { p: 0 };
  const q = {
    markL: gsap.quickSetter('.hero__mark-half--l', 'css'),
    markR: gsap.quickSetter('.hero__mark-half--r', 'css')
  };
  void q;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true
    }
  });

  /* ---------- frame scrub ----------
     Runs 0 → 1 across the first 92% of the pin, leaving a beat of
     stillness at the end for the closing copy.                     */
  tl.to(seq, {
    p: 1,
    ease: 'none',
    duration: 0.92,
    onUpdate: () => painter.setProgress(seq.p)
  }, 0);

  /* ---------- camera push ---------- */
  tl.fromTo(canvas,
    { scale: 1.06, yPercent: 2 },
    { scale: 0.98, yPercent: -3, ease: 'none', duration: 1 }, 0);

  /* ---------- wordmark: fills with the logo's gold, then snaps in two ----------
     The gold copy is clipped from the bottom; wiping that clip up as the
     reader scrolls pours the pack's colours into the outline, so the word is
     solid the instant the bar breaks. */
  const fillLayers = section.querySelectorAll('.hero__mark-img--fill');
  const fill = { v: 100 };
  const paintFill = () =>
    fillLayers.forEach((el) => el.style.setProperty('--fill', `${fill.v}%`));
  paintFill();

  tl.to(fill, { v: 0, ease: 'none', duration: SNAP, onUpdate: paintFill }, 0);

  const markL = '.hero__mark-half--l';
  const markR = '.hero__mark-half--r';

  tl.fromTo([markL, markR],
    { xPercent: 0, rotate: 0, scale: 1.02 },
    { scale: 1.06, ease: 'none', duration: SNAP }, 0);

  // The word breaks with the bar, then backs off fast — a readable word held
  // in two broken halves for a long scroll just looks like a rendering bug.
  tl.to(markL, { xPercent: -16, rotate: -3.2, ease: 'power2.out', duration: 0.2 }, SNAP);
  tl.to(markR, { xPercent: 16, rotate: 3.2, ease: 'power2.out', duration: 0.2 }, SNAP);
  tl.to(markL, { xPercent: -25, opacity: 0.12, ease: 'none', duration: 0.28 }, SNAP + 0.2);
  tl.to(markR, { xPercent: 25, opacity: 0.12, ease: 'none', duration: 0.28 }, SNAP + 0.2);

  /* ---------- light: cool green → warm caramel across the snap ---------- */
  tl.to('.hero__glow--cool', { opacity: 0.06, ease: 'none', duration: 0.42 }, SNAP - 0.1);
  tl.to('.hero__glow--warm', { opacity: 1, ease: 'none', duration: 0.42 }, SNAP - 0.1);
  tl.fromTo('.hero__glow--warm',
    { scale: 0.9 }, { scale: 1.15, ease: 'none', duration: 1 }, 0);

  /* ---------- shockwave on the snap frame ---------- */
  tl.fromTo('.hero__shock',
    { opacity: 0, scale: 0.15 },
    { opacity: 0.85, scale: 0.6, ease: 'power2.out', duration: 0.05 }, SNAP - 0.02);
  tl.to('.hero__shock',
    { opacity: 0, scale: 2.1, ease: 'power2.out', duration: 0.16 }, SNAP + 0.03);

  /* ---------- copy beats ---------- */
  const beats = gsap.utils.toArray('.beat');
  const windows = [[0.0, 0.28], [SNAP, 0.62], [0.68, 1.0]];

  beats.forEach((beat, i) => {
    const [inAt, outAt] = windows[i];
    const title = beat.querySelector('.beat__title');
    const sub = beat.querySelector('.beat__sub');

    if (i === 0) {
      // A scrubbed timeline sits at t=0 when the page loads, so the opening
      // beat has to be *authored* as visible — it gets its entrance from CSS.
      gsap.set(beat, { opacity: 1 });
      gsap.set([title, sub], { yPercent: 0, opacity: 1 });
    } else {
      gsap.set(beat, { opacity: 0 });
      gsap.set([title, sub], { yPercent: 40, opacity: 0 });
      tl.to(beat, { opacity: 1, duration: 0.02 }, inAt);
      tl.to(title, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.1 }, inAt);
      tl.to(sub, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.1 }, inAt + 0.02);
    }

    if (i < beats.length - 1) {
      tl.to([title, sub], { yPercent: -30, opacity: 0, ease: 'power2.in', duration: 0.08 }, outAt);
      tl.to(beat, { opacity: 0, duration: 0.02 }, outAt + 0.08);
    }
  });

  // keep .is-active in sync so the active beat is the only one hit-testable
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress;
      const active = p < windows[1][0] ? 0 : p < windows[2][0] ? 1 : 2;
      beats.forEach((b, i) => b.classList.toggle('is-active', i === active));
    }
  });

  /* ---------- rail + cue ---------- */
  tl.fromTo('.hero__rail-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 1 }, 0);
  tl.to('.hero__cue', { opacity: 0, y: 20, ease: 'none', duration: 0.06 }, 0);
  tl.to('.hero__eyebrow', { opacity: 0, ease: 'none', duration: 0.1 }, 0.72);

  return painter;
}
