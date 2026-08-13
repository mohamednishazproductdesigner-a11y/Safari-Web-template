# SAFARI — scroll site

Scroll-driven concept site for Gandour's Safari bar, built off the green-screen
render in `safari.webm`, the "Tattoo" TVC capture in `safari-tattoo.webm`, and
the two pack shots in `Chocholate flavours/`.

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # → dist/
```

## The scroll

| Section  | Scroll | What happens |
|---|---|---|
| **Hero** | 480vh | 80 transparent frames cut out of `safari.webm`, scrubbed on a canvas. Behind it the real pack logo — held back as a dark emboss, then filled with its own gold from the baseline up as you scroll. The bar snaps at 36% of the pin; the wordmark, gold by then, breaks in two on the same frame, the light turns from brand green to caramel, and three copy beats hand off across the break. |
| **Anatomy** | 320vh | The broken bar holds still while four callouts name the layers. Anchors are stored as fractions of the artwork, so they stay glued at any viewport. |
| **Craving** | 360vh | A 5.5s cut of the "Tattoo" TVC, autoplaying muted on loop from the moment the page loads. It starts as a small rounded card in the middle of the screen and opens out to full bleed as you scroll past — one GPU transform on a stage sized so `scale(1)` exactly covers the viewport. |
| **Flavours** | 400vh each | One pinned panel per flavour. The wrapper arrives tilted, tightens, then tears down a jagged seam — the two halves rotate away, crumbs puff out, and the bar inside comes forward as the story lands. |
| **Moments** | — | The campaign wall — three 3D cards, each holding a finished key visual shown whole, its caption, and a Bulk Orders CTA tinted to the poster's own colour. They swing in on their own axis, then lean toward the cursor with a specular glare, the artwork and copy sitting at different depths so the card parallaxes inside itself. Columns drift at different rates on scroll. |
| **Story** | — | Closing copy and a stroked marquee. |

## Adding a flavour

Append to `src/data/flavours.js`. The section, the tear and all the scroll
wiring are generated from that array — nothing else to touch.

```js
{
  id: 'hazelnut-crisp',
  name: 'Hazelnut Crisp',
  eyebrow: 'New',
  tagline: 'Something short and cocky.',
  description: '…',
  pack: '/img/pack-hazelnut.webp',   // transparent, ~1900px wide
  bar:  '/img/bar-open.webp',
  accent: '#12a551',
  accentLit: '#2fd472',
  chips: ['Crispy wafer', 'Caramel', 'Hazelnut', 'Milk chocolate'],
  stats: [{ value: '25%', label: 'Cocoa solids min.' }]
}
```

New pack shots want a transparent background, roughly 1900×540, subject
trimmed to the edges. `tools/build-assets.sh` shows the trim/encode recipe.

## Adding a campaign poster

The **Moments** posters are finished key visuals — the typography is baked into
the artwork, so the site frames them rather than composing type on top. Drop the
file in `public/img/moments/` and append to the `posters` array in
`src/data/posters.js` with a title, usage caption, alt text, and an `accent`
colour picked out of the artwork (it tints the hover glow and caption rule).
Portrait 4:5 keeps the wall even. Details in `public/img/moments/README.txt`.

## ⚠️ The Bulk Orders address is a placeholder

Every card carries a **Bulk Orders** CTA. It's configured once in `bulkOrder`
at the bottom of `src/data/posters.js`:

```js
export const bulkOrder = {
  label: 'Bulk Orders',
  mailto: 'orders@example.com',   // ← swap for the real trade desk
  subject: 'Safari bulk order enquiry'
};
```

Each link appends its card's title to the subject, so an enquiry arrives
already tagged with the flavour it came from. `orders@example.com` is a
**placeholder** — replace it before this goes anywhere public.

## Deploying

**Netlify** is the active host. `netlify.toml` carries the build command,
publish directory and cache headers, so connecting the repo is the whole setup —
Netlify builds `dist/` on every push to `main`. It serves from the root of the
site domain, so no base path is involved.

**GitHub Pages** is also wired up, in `.github/workflows/deploy.yml`, but set to
manual (`workflow_dispatch`) so it doesn't fail on every push while Netlify is
the primary. Run it from the Actions tab if you want both; add the `push`
trigger back if Pages becomes the main host.

Pages serves a project repo from `user.github.io/<repo-name>/`, not from the
root, so that workflow passes the repo name to Vite as `VITE_BASE`. Two things
follow from that:

- **Paths written in `index.html`** are rewritten by Vite automatically.
- **Paths written in JS are not.** Anything referenced from code goes through
  `asset()` in `src/modules/asset.js`, which prefixes `import.meta.env.BASE_URL`.
  Data files still write plain `/img/…` paths; the modules wrap them. If you add
  an asset reference in JS and skip `asset()`, it will work locally and 404 once
  deployed.

To check a sub-path build locally before pushing:

```bash
VITE_BASE=/safari-chocolate/ npm run build
```

## Assets

`tools/build-assets.sh` regenerates everything in `public/` from the source
media. Two settings in there matter and neither is guessable:

- **`similarity 0.10`** on the chroma key. Anything higher starts keying the
  dark crevices in the chocolate and punches holes through the matte.
- **The matte is eroded by one pixel.** That low similarity leaves a green rim
  on the anti-aliased edge — pixels that are part subject, part backdrop, so
  never green enough to key outright. `despill` is the obvious fix but it works
  on the whole frame, and a brown-and-gold subject is full of legitimate green;
  it drags the chocolate magenta. Shrinking the matte drops the contaminated
  pixels instead, and a slight blur puts the soft edge back. Done at full 2500px
  resolution, so it costs under half a pixel at delivery size — the flying
  crumbs and caramel strings all survive.

Alpha is stored losslessly (`-alpha_quality 100`); the wordmark is fully
lossless since it carries the hero at up to 1180px wide.

```bash
bash tools/build-assets.sh
```

**`safari-tattoo.webm` is gitignored.** It's a 38 MB screen capture and is only
needed to re-run that script. Everything it produces (`public/video/*`) is
committed, so the site builds and deploys without it — but drop it back in the
project root before running `build-assets.sh`.

## Notes

- **Frame sequences, never a scrubbed `<video>`.** A scrubbed video has to seek
  on every scroll tick and stalls; decoded frames just get drawn. The hero's 80
  frames (~3 MB) gate the preloader; the craving film's 90 frames (~2.3 MB)
  stream in afterwards and the painter falls back to the nearest decoded frame,
  so the section is scrubbable before it finishes loading. Frame index is
  deduped — the canvas only repaints when the frame actually changes.
- **Sticky pins, not ScrollTrigger pinning.** Sections use `position: sticky`
  and ScrollTrigger only reads progress. No pin-spacers to fight.
- **Scrubbed timelines are authored from their resting state.** A scrubbed
  timeline sits at t=0 on load, so anything that should be visible before the
  reader scrolls is set visible and gets its entrance from a CSS keyframe off
  `body.is-ready`.
- Colours, type and spacing are tokenised in `src/styles/base.css`.
