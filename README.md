# Shuhaab Bhat — portfolio

Local implementation of [sd.md](sd.md). Two static Astro pages: Info (`/`) and Works (`/works/`). No account, backend, cookies, or third-party runtime requests. Builds on Vercel add cookie-free [Vercel Web Analytics](https://vercel.com/docs/analytics) (anonymous visit counts, served from the site's own domain); local and other builds leave it out. Public fonts are self-hosted with their licenses.

## Run

Requires Node.js 22.23.4 or newer (tested with 24.22.1) and npm.

```sh
npm ci
npm run dev
```

For a production preview:

```sh
npm run build
npm run preview
```

The default local URL is `http://127.0.0.1:4321/`. Astro 7 preview runs as a background process; stop it with `npx astro preview stop`.

To disable Astro CLI telemetry, set `ASTRO_TELEMETRY_DISABLED=1` in your shell. It was disabled for this implementation's builds and checks.

## Edit

- `src/data/profile.ts`: headline, availability, biography, public contacts, experience, education, community.
- `src/data/projects.ts`: projects, newest first, each with a context line and Code / Live demo links (or a note when nothing is public).
- `src/styles/global.css`: typography, both palettes, layout, responsive behavior.
- `src/layouts/SiteLayout.astro`: shared navigation, metadata, footer.

The theme button alternates Light and Dark, restoring saved choices or resolving OS appearance once per load. The email address is shown as a mailto link with a separate clipboard icon; a successful copy shows a check and "Copied" for five seconds.

The optional `biographyHighlights` phrases (one per paragraph, in order) control coloured emphasis. A paragraph without a phrase renders plainly.

## Verify

```sh
npm run check
npm run build
npx playwright install chromium webkit
npm test
```

Tests cover generated content and asset privacy, compressed size, canonical configuration and sitemap, navigation, 404 status, keyboard skip link, theme persistence and storage failures, clipboard outcomes and focus, no-JavaScript use, responsive reflow, enlarged text, external runtime requests, and automated accessibility checks. Browser tests run against an isolated production preview on port 4322 in Chromium and WebKit, leaving an existing development server on port 4321 alone. Safari-style link navigation uses Option+Tab in the WebKit keyboard test.

Firefox is also configured: install it with `npx playwright install firefox` and run `npx playwright test --project=firefox`. Its test runtime could not open its temporary profile on this machine, so Firefox coverage remains unverified.

Generated screenshots and Lighthouse JSON reports are in `artifacts/` locally; they are ignored by Git and never copied into `dist/`. See [VERIFICATION.md](VERIFICATION.md) for measured results and remaining limits.

## Publication remains separate

Only `dist/` is deployable. Never upload the repository, design/research documents, private source material, or any résumé PDF.

When the production domain is chosen, set `SITE_ORIGIN` to its HTTPS origin and rebuild. This supplies canonical/Open Graph URLs and the two public sitemap entries. Without it, canonical URLs are omitted and the sitemap contains no URLs. The 404 page stays out of the sitemap.

Configure the selected host for HTTPS, a genuine custom 404, compression, immutable caching of fingerprinted assets, revalidated HTML, `X-Content-Type-Options: nosniff`, a referrer policy, and preview noindex. Verify these against the selected host before publication. No provider configuration or public deployment has been created.
