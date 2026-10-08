import { defineConfig, devices } from '@playwright/test';
const externalBase = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalBase ?? 'http://127.0.0.1:18080/',
    timezoneId: 'Asia/Shanghai',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBase ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 18080 --strictPort',
    url: 'http://127.0.0.1:18080',
    reuseExistingServer: false,
  },
});
