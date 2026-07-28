import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests-production',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8787',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'corepack pnpm build && corepack pnpm start',
    port: 8787,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
