import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4322' },
  projects: ['chromium', 'firefox', 'webkit'].map(name => ({ name, use: { browserName: name as 'chromium' | 'firefox' | 'webkit' } })),
  webServer: { command: 'npm run preview -- --port 4322', url: 'http://127.0.0.1:4322', reuseExistingServer: true },
});
