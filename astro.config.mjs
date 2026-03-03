// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.github.io',
  base: basePath,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
