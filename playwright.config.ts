import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 30000 },
  use: {
    baseURL: 'http://127.0.0.1:8081',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: 'npx expo start --web --port 8081',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      EXPO_NO_TELEMETRY: '1',
      EXPO_OFFLINE: '1',
      EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN: '',
      EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: '',
    },
  },
});
