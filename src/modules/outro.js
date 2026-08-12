import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function initOutro() {
  gsap.utils.toArray('.flavours__intro > *').forEach((el, i) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: i * 0.08,
      scrollTrigger: { trigger: '.flavours__intro', start: 'top 70%' }
    });
  });

  gsap.from('.outro__inner > *', {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.outro', start: 'top 65%' }
  });

  // gentle parallax on the stroked marquee
  gsap.to('.outro__track', {
    xPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.outro__marquee', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  ScrollTrigger.refresh();
}
