import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8181/web/',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'ECO_WEB_PORT=8181 node scripts/serve-web.js',
    url: 'http://127.0.0.1:8181/web/',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
