import ScrollTrigger from 'gsap/ScrollTrigger';

export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -40',
    end: 99999,
    onUpdate: (self) => {
      nav.classList.toggle('is-stuck', self.scroll() > 40);
      // hide while scrolling down, bring it back on the way up
      nav.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 600);
    }
  });
}
