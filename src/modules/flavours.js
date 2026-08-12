import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { flavours } from '../data/flavours.js';
import { asset } from './asset.js';

const CRUMBS = 22;

function markup(f, i) {
  const n = String(i + 1).padStart(2, '0');
  return `
  <section class="flav" id="${f.id}" style="--accent:${f.accent};--accent-lit:${f.accentLit}">
    <div class="flav__pin">
      <div class="flav__bg"></div>
      <span class="flav__index" aria-hidden="true">${n}</span>

      <div class="flav__stage">
        <img class="flav__bar" src="${asset(f.bar)}" alt="" aria-hidden="true" />
        <div class="flav__half flav__half--l" style="background-image:url('${asset(f.pack)}')"></div>
        <div class="flav__half flav__half--r" style="background-image:url('${asset(f.pack)}')"></div>
        <div class="flav__crumbs" aria-hidden="true">
          ${Array.from({ length: CRUMBS }, () => '<span class="flav__crumb"></span>').join('')}
        </div>
      </div>

      <div class="flav__info">
        <p class="flav__eyebrow flav__reveal">${f.eyebrow}</p>
        <h3 class="flav__name flav__reveal">${f.name}</h3>
        <p class="flav__tag flav__reveal">${f.tagline}</p>
        <p class="flav__desc flav__reveal">${f.description}</p>
        <ul class="flav__chips">
          ${f.chips.map((c) => `<li class="flav__reveal">${c}</li>`).join('')}
        </ul>
        <div class="flav__stats">
          ${f.stats.map((s) => `<div class="flav__stat flav__reveal"><b>${s.value}</b><span>${s.label}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

export function initFlavours() {
  const host = document.getElementById('flavourList');
  if (!host) return;

  host.innerHTML = flavours.map(markup).join('');

  host.querySelectorAll('.flav').forEach((section) => {
    const stage = section.querySelector('.flav__stage');
    const bar = section.querySelector('.flav__bar');
    const halfL = section.querySelector('.flav__half--l');
    const halfR = section.querySelector('.flav__half--r');
    const crumbs = gsap.utils.toArray(section.querySelectorAll('.flav__crumb'));
    const reveals = gsap.utils.toArray(section.querySelectorAll('.flav__reveal'));
    const index = section.querySelector('.flav__index');

    // scatter the crumbs once — deterministic per section so a resize keeps them put
    const seeds = crumbs.map(() => ({
      x: gsap.utils.random(-260, 260),
      y: gsap.utils.random(-150, 190),
      r: gsap.utils.random(-220, 220),
      s: gsap.utils.random(0.5, 1.5)
    }));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        invalidateOnRefresh: true
      }
    });

    /* -- 1. the pack arrives, tilted, and straightens out --
       Never starts at opacity 0: a scrubbed timeline holds its "from" state
       for the whole approach, which would leave a bare coloured panel on
       screen until the reader scrolls into the section. */
    tl.fromTo([halfL, halfR],
      { yPercent: 18, rotate: -7, scale: 0.86 },
      { yPercent: 0, rotate: 0, scale: 1, ease: 'power3.out', duration: 0.2 }, 0);

    tl.fromTo(stage, { scale: 0.94 }, { scale: 1, ease: 'none', duration: 0.5 }, 0);
    tl.fromTo(index, { yPercent: 30, opacity: 0.2 }, { yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.2 }, 0);

    /* -- 2. a wind-up: the halves pull tight against each other -- */
    tl.to(halfL, { xPercent: 1.4, ease: 'power2.inOut', duration: 0.08 }, 0.30);
    tl.to(halfR, { xPercent: -1.4, ease: 'power2.inOut', duration: 0.08 }, 0.30);

    /* -- 3. TEAR — the wrapper rips down the seam -- */
    tl.to(halfL, {
      xPercent: -26, yPercent: 7, rotate: -9, scale: 0.94,
      ease: 'power3.out', duration: 0.3
    }, 0.38);
    tl.to(halfR, {
      xPercent: 26, yPercent: -7, rotate: 9, scale: 0.94,
      ease: 'power3.out', duration: 0.3
    }, 0.38);
    tl.to([halfL, halfR], { opacity: 0.06, ease: 'none', duration: 0.24 }, 0.56);

    /* crumbs puff out of the tear */
    crumbs.forEach((c, i) => {
      const s = seeds[i];
      tl.fromTo(c,
        { x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 },
        {
          x: s.x, y: s.y, rotate: s.r, scale: s.s, opacity: 1,
          ease: 'power3.out', duration: 0.16
        }, 0.38 + i * 0.004);
      tl.to(c, { opacity: 0, y: s.y + 90, ease: 'power1.in', duration: 0.24 }, 0.58);
    });

    /* -- 4. the bar inside comes forward -- */
    tl.fromTo(bar,
      { opacity: 0, scale: 0.8, rotate: 4 },
      { opacity: 1, scale: 1, rotate: 0, ease: 'power3.out', duration: 0.28 }, 0.44);
    tl.to(bar, { scale: 1.08, ease: 'none', duration: 0.42 }, 0.58);

    /* -- 5. the story lands -- */
    reveals.forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 26 });
      tl.to(el, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.14 }, 0.58 + i * 0.022);
    });

    // No hand-off fade: the sticky pin releases exactly when this timeline
    // ends, so fading the panel out here just leaves an empty coloured field
    // on screen for the last stretch of scroll. Let it scroll away intact.
  });

  ScrollTrigger.refresh();
}
