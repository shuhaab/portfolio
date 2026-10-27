import { defineConfig } from 'astro/config';

// Set SITE_ORIGIN to the real HTTPS origin when preparing a public release.
const site = process.env.SITE_ORIGIN;
if (site) {
  const url = new URL(site);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname)) {
    throw new Error('SITE_ORIGIN must be a public HTTPS origin without credentials, a path, query, or fragment.');
  }
}

export default defineConfig({ site, output: 'static', trailingSlash: 'always' });
