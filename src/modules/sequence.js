/**
 * Frame-sequence loader + canvas painter.
 *
 * Both scroll-scrubbed sections are image sequences rather than <video>:
 * a scrubbed video has to seek on every scroll tick, which stalls and stutters.
 * Decoded frames just get drawn, so the scrub tracks the wheel exactly.
 */

export const SEQUENCES = {
  break: { dir: '/seq/break', count: 80 }
};

import { asset } from './asset.js';

const framePath = (dir, i) => asset(`${dir}/${String(i + 1).padStart(4, '0')}.webp`);

/**
 * Load a sequence, reporting 0..1 progress. Resolves with the image array.
 * The array is returned by reference and filled in place, so a caller can
 * start painting from it before every frame has landed.
 */
export function loadSequence({ dir, count }, onProgress, frames = new Array(count)) {
  let done = 0;

  // A few parallel lanes: quick on good connections, polite on bad ones.
  const LANES = 8;
  const queue = Array.from({ length: count }, (_, i) => i);

  const one = (i) =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        frames[i] = img;
        onProgress?.(++done / count);
        resolve();
      };
      img.src = framePath(dir, i);
    });

  const lane = async () => {
    while (queue.length) await one(queue.shift());
  };

  return Promise.all(Array.from({ length: LANES }, lane)).then(() => frames);
}

/**
 * Paints a frame sequence into a canvas.
 *
 * mode 'contain' letterboxes (product shots, transparent PNG-style frames);
 * mode 'cover' fills and crops (full-bleed film).
 */
export class SequencePainter {
  constructor(canvas, frames, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: opts.alpha !== false });
    this.frames = frames;
    this.index = -1;
    this.mode = opts.mode ?? 'contain';
    this.scale = opts.scale ?? 1;
    this.offsetX = opts.offsetX ?? 0; // fraction of canvas width
    this.offsetY = opts.offsetY ?? 0;
    this.dpr = 1;
    this.resize();
  }

  resize() {
    const { canvas } = this;
    const rect = canvas.getBoundingClientRect();
    // Cap DPR — 2x is plenty and keeps fill-rate sane on 3x phones.
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * this.dpr);
    canvas.height = Math.round(rect.height * this.dpr);
    this.cssW = rect.width;
    this.cssH = rect.height;
    this.repaint();
  }

  /** progress: 0..1 across the whole sequence */
  setProgress(p) {
    const i = Math.min(
      this.frames.length - 1,
      Math.max(0, Math.round(p * (this.frames.length - 1)))
    );
    if (i === this.index) return;
    this.index = i;
    this.repaint();
  }

  setTransform({ scale, offsetX, offsetY }) {
    if (scale !== undefined) this.scale = scale;
    if (offsetX !== undefined) this.offsetX = offsetX;
    if (offsetY !== undefined) this.offsetY = offsetY;
    this.repaint();
  }

  /**
   * The requested frame, or the nearest one that has actually decoded.
   * Lets a section stay watchable while its sequence is still streaming in
   * instead of flashing an empty canvas.
   */
  frameAt(i) {
    const f = this.frames;
    if (f[i]?.naturalWidth) return f[i];
    for (let d = 1; d < f.length; d++) {
      if (f[i - d]?.naturalWidth) return f[i - d];
      if (f[i + d]?.naturalWidth) return f[i + d];
    }
    return null;
  }

  repaint() {
    const img = this.frameAt(Math.max(this.index, 0));
    if (!img) return;

    const { ctx, dpr, cssW, cssH } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const base = this.mode === 'cover'
      ? Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight)
      : Math.min(cssW / img.naturalWidth, cssH / img.naturalHeight);

    const fit = base * this.scale;
    const w = img.naturalWidth * fit;
    const h = img.naturalHeight * fit;
    const x = (cssW - w) / 2 + this.offsetX * cssW;
    const y = (cssH - h) / 2 + this.offsetY * cssH;

    ctx.drawImage(img, x, y, w, h);
  }
}
