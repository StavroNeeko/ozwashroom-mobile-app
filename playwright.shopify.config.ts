import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: ['shopify-images.spec.ts', 'checkout.spec.ts'],
  use: { ...base.use, baseURL: 'http://127.0.0.1:8082' },
  webServer: {
    command: 'npx expo start --web --port 8082',
    url: 'http://127.0.0.1:8082',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      EXPO_NO_TELEMETRY: '1',
      EXPO_OFFLINE: '1',
      EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN: 'example.myshopify.com',
      EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: 'public-test-token',
      EXPO_PUBLIC_SHOPIFY_API_VERSION: '2026-07',
      EXPO_PUBLIC_SHOPIFY_DEALS_COLLECTION: 'test-deals',
      EXPO_PUBLIC_SHOPIFY_CATEGORY_HANDLES: '{}',
    },
  },
});
