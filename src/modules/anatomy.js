import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

/**
 * Callouts on the broken-open bar.
 * `x`/`y` are fractions of the *rendered image box*, so the pins stay glued
 * to the artwork at any viewport size.
 */
const LAYERS = [
  { x: 0.470, y: 0.315, side: 'left',  lead: 0.42, name: 'Crispy wafer',   note: 'Layer 01' },
  { x: 0.440, y: 0.600, side: 'left',  lead: 0.38, name: 'Golden caramel', note: 'Layer 02' },
  { x: 0.575, y: 0.440, side: 'right', lead: 0.38, name: 'Crisped rice',   note: 'Layer 03' },
  { x: 0.790, y: 0.155, side: 'right', lead: 0.17, name: 'Milk chocolate', note: 'Layer 04' }
];

export function initAnatomy() {
  const section = document.querySelector('.anatomy');
  const stage = section?.querySelector('.anatomy__stage');
  const img = section?.querySelector('.anatomy__bar');
  const layer = document.getElementById('anatomyPins');
  if (!section || !stage || !img || !layer) return;

  // ---- build ----
  const pins = LAYERS.map((d) => {
    const el = document.createElement('div');
    el.className = `pin${d.side === 'left' ? ' pin--left' : ''}`;
    el.innerHTML =
      `<span class="pin__dot"></span>` +
      `<span class="pin__line"></span>` +
      `<span class="pin__label"><b class="pin__name">${d.name}</b><span class="pin__note">${d.note}</span></span>`;
    layer.appendChild(el);
    return { el, d, line: el.querySelector('.pin__line'), label: el.querySelector('.pin__label') };
  });

  // ---- position the callout layer exactly over the rendered artwork ----
  // `object-fit: contain` letterboxes inside the element box, so the drawn
  // artwork is smaller than the <img> rect — recompute it rather than trust it.
  const place = () => {
    const box = img.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    if (!box.width || !img.naturalWidth) return;

    const fit = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const w = img.naturalWidth * fit;
    const h = img.naturalHeight * fit;
    const left = box.left - sr.left + (box.width - w) / 2;
    const top = box.top - sr.top + (box.height - h) / 2;

    Object.assign(layer.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${w}px`,
      height: `${h}px`,
      right: 'auto',
      bottom: 'auto'
    });

    const ir = { width: w, height: h };
    const narrow = window.innerWidth < 860;

    const setLead = ({ el, d, line, label }, lead, side = d.side) => {
      el.classList.toggle('pin--left', side === 'left');
      if (side === 'right') {
        line.style.left = '0px';
        line.style.width = `${lead}px`;
        label.style.left = `${lead + 12}px`;
      } else {
        line.style.left = `${-lead}px`;
        line.style.width = `${lead}px`;
        label.style.left = `${-lead - 12}px`;
      }
    };

    const leads = pins.map(({ d }) => ir.width * d.lead * (narrow ? 0.34 : 1));
    pins.forEach((pin, i) => {
      pin.el.style.left = `${pin.d.x * ir.width}px`;
      pin.el.style.top = `${pin.d.y * ir.height}px`;
      setLead(pin, leads[i]);
    });

    // Second pass: labels are laid out from the anchor outwards, so on narrow
    // screens they can run past the stage. Pull the lead back, and if the
    // label still will not fit, send it out the other side — better a flipped
    // callout than one `overflow: hidden` has guillotined.
    const pad = 8;
    pins.forEach((pin, i) => {
      const over = () => {
        const lr = pin.label.getBoundingClientRect();
        return pin.el.classList.contains('pin--left')
          ? (sr.left + pad) - lr.left
          : lr.right - (sr.right - pad);
      };

      let o = over();
      if (o <= 0) return;

      setLead(pin, Math.max(10, leads[i] - o));
      if (over() <= 0) return;

      const flipped = pin.d.side === 'right' ? 'left' : 'right';
      setLead(pin, leads[i], flipped);
      o = over();
      if (o > 0) setLead(pin, Math.max(10, leads[i] - o), flipped);
    });
  };

  place();
  if (!img.complete) img.addEventListener('load', () => { place(); ScrollTrigger.refresh(); });
  ScrollTrigger.addEventListener('refreshInit', place);

  // ---- animate ----
  gsap.set(pins.map((p) => p.el), { opacity: 0 });
  gsap.set(pins.map((p) => p.line), { scaleX: 0 });
  // read the side off the element — `place()` may have flipped it to fit
  gsap.set(pins.map((p) => p.label), {
    opacity: 0,
    x: (i) => (pins[i].el.classList.contains('pin--left') ? 18 : -18)
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true
    }
  });

  // headline + bar settle first
  tl.fromTo('.anatomy__head', { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.12 }, 0);
  tl.fromTo(img,
    { scale: 0.86, rotate: -3, y: 40 },
    { scale: 1, rotate: 0, y: 0, ease: 'power2.out', duration: 0.24 }, 0);
  // the slow push rides on the stage so the callouts scale with the artwork
  tl.to(stage, { scale: 1.05, ease: 'none', duration: 0.5 }, 0.5);

  // then the layers name themselves, one at a time
  pins.forEach(({ el, line, label }, i) => {
    const at = 0.26 + i * 0.13;
    tl.to(el, { opacity: 1, duration: 0.04 }, at);
    tl.to(line, { scaleX: 1, ease: 'power2.out', duration: 0.1 }, at);
    tl.to(label, { opacity: 1, x: 0, ease: 'power3.out', duration: 0.12 }, at + 0.05);
  });

  tl.fromTo('.anatomy__foot', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.86);
}
