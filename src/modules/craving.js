import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

/** clip aspect — the stage is built to match it exactly */
const ASPECT = 1920 / 970;

/** how wide the small centred state sits */
const SMALL_VW = 0.62;
const SMALL_MAX = 460;

/** visual corner radius of the small card, in px */
const SMALL_RADIUS = 18;

export function initCraving() {
  const section = document.querySelector('.craving');
  const stage = document.getElementById('cravingStage');
  const video = document.getElementById('cravingVideo');
  if (!section || !stage || !video) return;

  /* ---------- autoplay ----------
     The markup already carries autoplay/muted/playsinline, but browsers can
     still reject the initial attempt; retry once the file can actually play.
     Nothing here waits for the reader — the film is running before they
     arrive. */
  const play = () => {
    const p = video.play();
    if (p?.catch) p.catch(() => {});
  };
  play();
  video.addEventListener('canplay', play, { once: true });

  // ...but don't burn a decoder on it while it is nowhere near the viewport
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([e]) => (e.isIntersecting ? play() : video.pause()),
      { rootMargin: '150% 0px' }
    ).observe(section);
  }

  /* ---------- small → full bleed ---------- */
  // scale(1) covers the viewport, so the start scale is just the ratio of the
  // small card's width to that covering width.
  const startScale = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const coverW = Math.max(vw, ASPECT * vh);
    return Math.min(vw * SMALL_VW, SMALL_MAX) / coverW;
  };

  let s0 = startScale();
  gsap.set(stage, {
    scale: s0,
    borderRadius: `${SMALL_RADIUS / s0}px`,
    boxShadow: '0 120px 200px rgba(0,0,0,0.75)'
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true
    }
  });

  tl.fromTo(stage,
    { scale: () => (s0 = startScale()), borderRadius: () => `${SMALL_RADIUS / s0}px` },
    {
      scale: 1,
      borderRadius: '0px',
      boxShadow: '0 0px 0px rgba(0,0,0,0)',
      ease: 'power2.inOut',
      duration: 0.5
    }, 0);

  // the ambient glow behind the small card gives way to the film itself
  tl.to('.craving__glow', { opacity: 0, ease: 'none', duration: 0.34 }, 0.1);
  tl.to('.craving__scrim', { opacity: 1, ease: 'none', duration: 0.3 }, 0.24);

  /* ---------- copy beats ---------- */
  const beats = gsap.utils.toArray(section.querySelectorAll('.cbeat'));
  const windows = [[0.0, 0.34], [0.4, 0.66], [0.72, 1.0]];

  beats.forEach((beat, i) => {
    const [inAt, outAt] = windows[i];
    const title = beat.querySelector('.cbeat__title');
    const sub = beat.querySelector('.cbeat__sub');

    if (i === 0) {
      // visible at rest — a scrubbed timeline holds t=0 during the approach
      gsap.set(beat, { opacity: 1 });
      gsap.set([title, sub], { yPercent: 0, opacity: 1 });
    } else {
      gsap.set(beat, { opacity: 0 });
      gsap.set([title, sub], { yPercent: 36, opacity: 0 });
      tl.to(beat, { opacity: 1, duration: 0.02 }, inAt);
      tl.to(title, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.1 }, inAt);
      tl.to(sub, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.1 }, inAt + 0.02);
    }

    if (i < beats.length - 1) {
      tl.to([title, sub], { yPercent: -26, opacity: 0, ease: 'power2.in', duration: 0.08 }, outAt);
      tl.to(beat, { opacity: 0, duration: 0.02 }, outAt + 0.08);
    }
  });

  ScrollTrigger.addEventListener('refreshInit', () => { s0 = startScale(); });
}
