import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { posters, bulkOrder } from '../data/posters.js';
import { asset } from './asset.js';

/** how far the card leans toward the pointer, in degrees */
const TILT = 11;

const enquiryHref = (title) =>
  `mailto:${bulkOrder.mailto}?subject=${encodeURIComponent(`${bulkOrder.subject} — ${title}`)}`;

function cardMarkup(p) {
  return `
  <article class="poster" id="${p.id}" style="--accent:${p.accent}">
    <div class="poster__tilt">
      <div class="poster__frame">
        <img class="poster__art" src="${asset(p.image)}" alt="${p.alt}" loading="lazy" decoding="async" />
      </div>

      <div class="poster__body">
        <h3 class="poster__title">${p.title}</h3>
        <p class="poster__usage">${p.usage}</p>

        <a class="poster__cta" href="${enquiryHref(p.title)}">
          <span>${bulkOrder.label}</span>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>

      <span class="poster__glare" aria-hidden="true"></span>
    </div>
  </article>`;
}

/**
 * Pointer-driven lean. Rotation is interpolated with quickTo rather than set
 * straight from the event, so the card eases toward the cursor instead of
 * snapping to every mousemove.
 */
function attachTilt(card) {
  const tilt = card.querySelector('.poster__tilt');
  const glare = card.querySelector('.poster__glare');

  const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.5, ease: 'power3' });
  const tz = gsap.quickTo(tilt, 'z', { duration: 0.5, ease: 'power3' });

  const move = (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    ry(x * TILT * 2);
    rx(-y * TILT * 2);
    glare.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    glare.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };

  const enter = () => { tz(46); gsap.to(glare, { opacity: 1, duration: 0.4 }); };
  const leave = () => {
    rx(0); ry(0); tz(0);
    gsap.to(glare, { opacity: 0, duration: 0.5 });
  };

  card.addEventListener('pointerenter', enter);
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerleave', leave);
}

export function initPosters() {
  const grid = document.getElementById('posterGrid');
  if (!grid) return;

  grid.innerHTML = posters.map(cardMarkup).join('');

  const cards = gsap.utils.toArray(grid.querySelectorAll('.poster'));
  const flat = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none)').matches;

  cards.forEach((card, i) => {
    const tilt = card.querySelector('.poster__tilt');

    // The cards swing in on their own axis: turned away, pushed back in Z,
    // then settling flat to the reader.
    gsap.fromTo(tilt,
      {
        opacity: 0,
        rotationY: i % 2 ? -26 : 26,
        rotationX: 14,
        z: -220,
        y: 60
      },
      {
        opacity: 1, rotationY: 0, rotationX: 0, z: 0, y: 0,
        duration: 1.35,
        ease: 'power3.out',
        delay: i * 0.14,
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
        // only hand the card over to the pointer once it has landed
        onComplete: () => { if (!flat && !coarse) attachTilt(card); }
      });

    // the contents rise a beat behind the card itself
    gsap.from(card.querySelectorAll('.poster__title, .poster__usage, .poster__cta'), {
      y: 26,
      opacity: 0,
      duration: 0.8,
      stagger: 0.06,
      ease: 'power3.out',
      delay: i * 0.14 + 0.45,
      scrollTrigger: { trigger: grid, start: 'top 82%', once: true }
    });

    // Columns drift at slightly different rates — motion without cropping
    // into artwork whose type runs to the trim.
    const drift = [40, 0, 26][i % 3];
    if (drift) {
      gsap.fromTo(card,
        { y: drift },
        {
          y: -drift,
          ease: 'none',
          scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
    }
  });

  ScrollTrigger.refresh();
}
