import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4322' },
  projects: ['chromium', 'firefox', 'webkit'].map(name => ({ name, use: { browserName: name as 'chromium' | 'firefox' | 'webkit' } })),
  // --ignore-lock keeps `astro preview` in the foreground. Without it, Astro moves the server to the
  // background when an AI coding agent runs the tests, and Playwright reports that the server exited early.
  webServer: { command: 'npm run preview -- --port 4322 --ignore-lock', url: 'http://127.0.0.1:4322', reuseExistingServer: true },
});
