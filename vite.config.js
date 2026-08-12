import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves a project repo from /<repo-name>/, so CI sets this.
  // Defaults to root for local dev and for any host serving from a domain.
  base: process.env.VITE_BASE ?? '/',
  server: { port: 5180, host: true },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0
  }
});
