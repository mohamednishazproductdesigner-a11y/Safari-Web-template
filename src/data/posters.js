/**
 * MOMENTS — the campaign wall.
 *
 * These are finished key visuals: the typography is baked into the artwork,
 * so the site presents them rather than composing over them. Each one just
 * needs a caption and an accent colour pulled from the poster itself, which
 * tints its hover glow and caption rule.
 *
 * To add another: drop the file in `public/img/moments/` and append here.
 * Portrait 4:5 keeps the wall even; anything else still works, the frame
 * crops to fill.
 */

export const posters = [
  {
    id: 'peanut-crisp',
    image: '/img/moments/peanut-crisp.webp',
    title: 'Peanut Crisp',
    line: 'More Crunch. More Fun.',
    usage: 'Key visual · Print & OOH',
    alt: 'Peanut Crisp poster — a cross-section of the bar in flowing chocolate with roasted peanuts, on red',
    accent: '#f6871f'
  },
  {
    id: 'more-crunch',
    image: '/img/moments/more-crunch.webp',
    title: 'More Crunch. More Fun.',
    line: 'Two bars, no sharing',
    usage: 'Key visual · Social & in-store',
    alt: 'Poster of a woman holding two Safari Peanut Crisp bars in front of her face, on green',
    accent: '#12a551'
  },
  {
    id: 'crunch-into-the-wild',
    image: '/img/moments/crunch-into-the-wild.webp',
    title: 'Crunch Into The Wild',
    line: 'The pack and what is under it',
    usage: 'Key visual · Retail & shelf',
    alt: 'Crunch Into The Wild poster — Safari Peanut Crisp pack beside the cut bar, on yellow',
    accent: '#f7c948'
  }
];

/**
 * The bulk-order CTA that sits inside every card.
 *
 * ⚠️ Placeholder address — swap it for the real trade desk before this goes
 * anywhere public. `subject` gets the card's title appended so an enquiry
 * arrives already tagged with the flavour it came from.
 */
export const bulkOrder = {
  label: 'Bulk Orders',
  mailto: 'orders@example.com',
  subject: 'Safari bulk order enquiry'
};
