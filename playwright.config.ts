import { defineConfig, devices } from '@playwright/test';

// Performance optimization flags for Chromium
const PERFORMANCE_ARGS = [
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-gpu-sandbox',
  '--enable-gpu-rasterization',
  '--enable-zero-copy',
  '--ignore-gpu-blocklist',
  '--no-sandbox',
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : '50%',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: process.env.CI
    ? [['github'], ['json', { outputFile: 'test-results/results.json' }]]
    : [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    launchOptions: {
      args: PERFORMANCE_ARGS,
    },
  },
  projects: process.env.FULL_BROWSER_MATRIX
    ? [
        // Full: All browsers for comprehensive testing
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ]
    : [
        // Default: Chromium only for fast iteration
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],
  webServer: {
    command: 'npm run dev -- --port 4000',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  globalSetup: './tests/e2e/global-setup.ts',
});
