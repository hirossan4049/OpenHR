import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. Disable auto opening the report */
  reporter: [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Always record videos */
    video: 'on',
    /* Take screenshots only on failures */
    screenshot: 'only-on-failure',
    /* Run all tests with an authenticated storage state */
    storageState: 'e2e/.auth/user.json',
  },

  /* Global auth setup to prepare a logged-in storageState */
  globalSetup: './e2e/auth.setup.ts',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: ['e2e/*.auth.spec.ts'], // Skip auth tests for non-auth projects
    },
    {
      name: 'chromium-auth',
      testMatch: ['e2e/*.auth.spec.ts'], // Only auth tests
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: ['e2e/*.auth.spec.ts'], // Skip auth tests for non-auth projects
    },
    {
      name: 'firefox-auth',
      testMatch: ['e2e/*.auth.spec.ts'], // Only auth tests
      use: { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: ['e2e/*.auth.spec.ts'], // Skip auth tests for non-auth projects
    },
    {
      name: 'webkit-auth',
      testMatch: ['e2e/*.auth.spec.ts'], // Only auth tests
      use: { ...devices['Desktop Safari'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests
   * Set PLAYWRIGHT_NO_SERVER=1 to skip spawning the server and reuse an existing one. */
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: 'bun run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
});
