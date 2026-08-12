#!/usr/bin/env bash
# ============================================================================
# Regenerates every image asset in public/ from safari.webm + Chocholate flavours/
#
# The source clip is a green-screen render at 2500x1406 / VP9 / 60fps:
#   0.00 – 0.78s  intact bar rotating
#   0.78 – 2.15s  the bar snaps, caramel pulls, crumbs fly   ← the hero scrub
#   2.15 – 2.40s  dissolve into the SAFARI logo
#   2.40 – 6.40s  logo, then back to a bar
#
# Requires ffmpeg on PATH. Run from the project root:  bash tools/build-assets.sh
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

FF=${FF:-ffmpeg}

# Chroma key settings, tuned against this clip:
#   0x2ABD52  the mid green of the backdrop (it has a radial glow, 0x24B24B → 0x2AC75A)
#   0.10      similarity — low enough that dark chocolate crevices are NOT keyed,
#             which is what produces a solid, hole-free matte
#   0.03      blend
# No despill: the render has no green spill, and despill visibly shifts the
# caramel and chocolate hues away from the source.
KEY="chromakey=0x2ABD52:0.10:0.03"

# Union bounding box of the subject across 0 – 2.3s, padded.
CROP_SEQ="crop=1520:1090:470:196"

echo "→ hero break sequence (80 frames)"
rm -rf public/seq/break && mkdir -p public/seq/break
"$FF" -y -v error -ss 0.05 -t 2.05 -i safari.webm \
  -vf "fps=39,${KEY},${CROP_SEQ},scale=1200:-1,format=rgba" \
  -c:v libwebp -quality 72 -compression_level 6 -preset picture \
  public/seq/break/%04d.webp

# ---------------------------------------------------------------------------
# safari-tattoo.webm is a screen capture of the Gandour "Tattoo" TVC:
#   0.0 – 9.5s    boy in his room (first ~4s carry the YouTube player chrome)
#   11.5 – 13.6s  slow push-in on the bar left out on the desk
#   13.6 – 14.0s  a hand comes in and takes it
#   14.1s         cut
#   14.1 – 15.1s  he holds it up, wrapper already off
#   16s onwards   pack-shot animation, tattoo, Gandour end card
#
# 10.40 + 5.50s is the loop: he looks up, the desk, the grab, the reveal.
#
# crop=3448:1740:0:40 drops the letterbox (40px top) AND the recorder
# watermark that sits at x 3035–3102 / y 1784–1854. Result is a clean 2:1.
# ---------------------------------------------------------------------------
echo "→ craving film"
mkdir -p public/video
CV="crop=3448:1740:0:40,scale=1920:-2"
# muted autoplay, so the audio track is dead weight — strip it
"$FF" -y -v error -ss 10.40 -t 5.50 -i safari-tattoo.webm -an -vf "$CV" \
  -c:v libx264 -profile:v high -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart \
  public/video/craving.mp4
"$FF" -y -v error -ss 10.40 -t 5.50 -i safari-tattoo.webm -an -vf "$CV" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  public/video/craving.webm
"$FF" -y -v error -ss 10.40 -i safari-tattoo.webm -frames:v 1 -vf "$CV,scale=960:-2" \
  -c:v libwebp -quality 74 public/video/craving-poster.webp

mkdir -p public/img

echo "→ stills"
# broken open, layers visible — used by the anatomy callouts and the posters
"$FF" -y -v error -ss 1.05 -i safari.webm -frames:v 1 \
  -vf "${KEY},crop=1460:1070:505:210,scale=1400:-1,format=rgba" \
  -c:v libwebp -quality 84 -compression_level 6 public/img/bar-open.webp

# intact bar
"$FF" -y -v error -ss 0.05 -i safari.webm -frames:v 1 \
  -vf "${KEY},crop=1440:520:540:490,scale=1500:-1,format=rgba" \
  -c:v libwebp -quality 84 -compression_level 6 public/img/bar-whole.webp

# 3D wordmark, lifted from the logo section of the clip
"$FF" -y -v error -ss 3.6 -i safari.webm -frames:v 1 \
  -vf "${KEY},crop=1180:320:670:574,scale=900:-1,format=rgba" \
  -c:v libwebp -quality 90 -compression_level 6 public/img/logo-3d.webp

echo "→ packs"
"$FF" -y -v error -i "Chocholate flavours/662814645e833bcab904df05_Safari-Peanut_Crisp_lfmxk.webp" \
  -vf "crop=4886:1387:59:59,scale=1900:-1,format=rgba" \
  -c:v libwebp -quality 86 -compression_level 6 public/img/pack-peanut.webp

"$FF" -y -v error -i "Chocholate flavours/662814ba9859749a5daab4df_Safari-Caramel_Crisp_agpnd.webp" \
  -vf "crop=4889:1387:59:56,scale=1900:-1,format=rgba" \
  -c:v libwebp -quality 86 -compression_level 6 public/img/pack-caramel.webp

echo "→ favicon"
"$FF" -y -v error -i public/img/logo-3d.webp \
  -filter_complex "color=c=0x12a551:s=900x900:d=1[bg];[0:v]crop=150:210:12:18,scale=520:-1[s];[bg][s]overlay=(W-w)/2:(H-h)/2,scale=96:96" \
  -frames:v 1 public/favicon.png

echo "done — $(find public/seq/break -name '*.webp' | wc -l | tr -d ' ') frames, $(du -sh public | cut -f1) total"
