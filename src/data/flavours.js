/**
 * FLAVOURS
 * --------
 * Add a new flavour by appending an object here — the section, the tear
 * animation and all the scroll wiring are generated from this array.
 *
 * pack   : transparent wrapper shot (public/img/…) — ~1900px wide works best
 * bar    : what is revealed once the wrapper tears open
 * accent : the two colours the whole panel is themed from
 */

export const flavours = [
  {
    id: 'caramel-crisp',
    name: 'Caramel Crisp',
    eyebrow: 'The original',
    tagline: 'The snap you grew up on.',
    description:
      'Crisp wafer layered with golden caramel and cereal crisp, then enrobed in Gandour milk chocolate. The green wrapper that has been in every corner shop for as long as anyone can remember.',
    pack: '/img/pack-caramel.webp',
    bar: '/img/bar-open.webp',
    accent: '#12a551',
    accentLit: '#2fd472',
    chips: ['Crispy wafer', 'Golden caramel', 'Cereal crisp', 'Milk chocolate'],
    stats: [
      { value: '25%', label: 'Cocoa solids min.' },
      { value: '4', label: 'Layers' },
      { value: '1857', label: 'Gandour since' }
    ]
  },
  {
    id: 'peanut-crisp',
    name: 'Peanut Crisp',
    eyebrow: 'Roasted & salted',
    tagline: 'Louder. Nuttier. Messier.',
    description:
      'The same wafer-and-caramel architecture, rebuilt around roasted peanuts and crisp. Heavier on the caramel, rougher on the bite — the one you eat over a napkin.',
    pack: '/img/pack-peanut.webp',
    bar: '/img/bar-open.webp',
    accent: '#f6871f',
    accentLit: '#ffb24d',
    chips: ['Wafer 25%', 'Crisp & peanuts 13%', 'Caramel 27%', 'Milk chocolate'],
    stats: [
      { value: '27%', label: 'Caramel' },
      { value: '13%', label: 'Crisp & peanuts' },
      { value: '25%', label: 'Wafer' }
    ]
  }
];
