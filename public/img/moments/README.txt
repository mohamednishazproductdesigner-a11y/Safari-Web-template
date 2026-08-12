CAMPAIGN KEY VISUALS
--------------------
Finished posters. The typography is baked into the artwork, so the site frames
them rather than composing type on top.

Currently in use (see src/data/posters.js):
  peanut-crisp.webp          Peanut Crisp            red
  more-crunch.webp           More Crunch. More Fun.  green
  crunch-into-the-wild.webp  Crunch Into The Wild    yellow

To add another:
  1. Drop the file here. Portrait 4:5 keeps the wall even — anything else
     still works, the frame crops to fill. ~1100px wide is plenty; the
     posters render at roughly 460px on a 1440 viewport.
  2. Append an entry to the `posters` array in src/data/posters.js with a
     title, a usage caption, alt text, and an `accent` colour picked out of
     the artwork (it tints the hover glow and the caption rule).

Encode with:
  ffmpeg -i poster.png -c:v libwebp -quality 84 -compression_level 6 \
         -preset photo poster.webp
