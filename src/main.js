import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import './styles/base.css';
import './styles/ui.css';
import './styles/hero.css';
import './styles/anatomy.css';
import './styles/craving.css';
import './styles/flavours.css';
import './styles/posters.css';

import { loadSequence, SEQUENCES } from './modules/sequence.js';
import { initHero } from './modules/hero.js';
import { initCraving } from './modules/craving.js';
import { initAnatomy } from './modules/anatomy.js';
import { initFlavours } from './modules/flavours.js';
import { initPosters } from './modules/posters.js';
import { initNav } from './modules/nav.js';
import { initOutro } from './modules/outro.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- smooth scroll ---------------- */
function initSmoothScroll() {
  if (reduced) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // native momentum on touch feels better than an emulated one
    syncTouch: false
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // anchor links go through Lenis so they inherit the easing
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -1, duration: 1.4 });
    });
  });

  // handy for debugging / automated screenshots
  window.__lenis = lenis;
  return lenis;
}

/* ---------------- preloader ---------------- */
const preloader = document.getElementById('preloader');
const fill = preloader?.querySelector('.preloader__fill');
const pct = preloader?.querySelector('.preloader__pct');

function setProgress(p) {
  const v = Math.round(p * 100);
  if (fill) fill.style.width = `${v}%`;
  if (pct) pct.textContent = `${v}%`;
}

function dismissPreloader() {
  preloader?.classList.add('is-done');
  document.body.style.removeProperty('overflow');
  setTimeout(() => preloader?.remove(), 900);
}

/* ---------------- boot ---------------- */
async function boot() {
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const heroFrames = await loadSequence(SEQUENCES.break, setProgress);

  // let the fonts land before we measure anything for pinning
  await (document.fonts?.ready ?? Promise.resolve());

  initSmoothScroll();
  initNav();
  initHero(heroFrames);
  initAnatomy();
  initCraving();
  initFlavours();
  initPosters();
  initOutro();

  ScrollTrigger.refresh();

  // hand the page over — intros are CSS keyframes off `.is-ready` so nothing
  // depends on a rAF tween landing, and the nav keeps its transform free for
  // the show/hide-on-scroll state.
  dismissPreloader();
  document.body.classList.add('is-ready');
}

boot();
