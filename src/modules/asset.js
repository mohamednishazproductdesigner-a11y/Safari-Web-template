/**
 * Resolve a `public/` asset against the deployment base.
 *
 * Vite rewrites absolute paths written inside index.html, but it does NOT
 * touch string literals in JS. Anything referenced from code therefore has to
 * go through here, or it 404s the moment the site is served from a
 * sub-path — which is exactly what GitHub Pages does for a project repo
 * (`user.github.io/<repo>/`).
 *
 * Data files keep writing plain `/img/…` paths; the modules wrap them here.
 */
export const asset = (path) =>
  import.meta.env.BASE_URL + String(path).replace(/^\/+/, '');
