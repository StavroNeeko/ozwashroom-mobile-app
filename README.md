# Ozwashroom mobile

An Expo / React Native / TypeScript storefront for Android and iPhone, implementing [Issue #1](https://github.com/StavroNeeko/ozwashroom-mobile-app/issues/1). Expo Router supplies Home, Categories, Search, Cart and Account tabs. The interface adapts to phones, tablets and web.

## Run locally

Use Node.js **22.13+** (Node 24 recommended) and npm. This project uses **Expo SDK 58**; use an Expo Go version that supports SDK 58, or a matching development build.

```sh
npm ci
cp .env.example .env
npm start
```

With no Shopify domain or token, the app uses **clearly labelled sample data**. Product names and photos are sourced from the official website; sample availability, arrival dates, prices and discounts are fictitious and do not represent live Ozwashroom offers. Sample mode requires no credentials or external image services. Fonts are bundled locally. Ten official product photos and the company logo are bundled for offline previews; live Shopify products use their own catalogue images.

- **Android:** scan the QR code with Expo Go, or run `npm run android` with an Android emulator installed and running.
- **iPhone:** scan the QR code with Camera and open compatible Expo Go. `npm run ios` opens an iOS Simulator on **macOS with Xcode**. Linux cannot run the iOS Simulator.
- **Web:** run `npm run web`. This supports UI development; it does not replace real device tests.
- A device must be able to reach the Metro server. Cloud environments without device connectivity can validate web and native bundles; use a local machine for Expo Go device testing.

Identifiers in `app.json` are provisional. Confirm package IDs, store assets, signing and privacy requirements before distributable builds. This project does not publish apps or alter the live Shopify store.

Web uses a client-rendered single-page shell with eager Expo Router routes. This keeps direct-route reloads independent of development-server static rendering. If hosting the exported web build, configure unknown paths (such as `/product/...`) to fall back to `index.html`.

## V1 features

- Branded header, search entry and cart count.
- Special Deals, New Arrivals (newest first) and Discounted Products, with View All and empty states.
- AUD selling/compare-at prices and percentage savings from the same selected variant.
- Six categories: hand dryers, paper towel dispensers, soap dispensers, sanitary bins, baby change stations and grab rails.
- Product details, title/category search, quantity controls and a cart saved on the current device.
- Loading, error/retry, unavailable product, empty collection/cart, no-results and unknown-route states. Home supports pull-to-refresh.
- An Account placeholder explaining that sign-in and order history are future work, with an external link to the public website.

**Checkout, payments, customer login and order creation are not implemented.** The cart is local and never creates a Shopify order or checkout. Sample and Shopify carts use separate storage keys. Stored variant IDs and quantities are reconciled with current prices and availability on launch/refresh.

## Connect Shopify Storefront

1. Configure a **public Storefront API token** with read access to products and collections (for example, using the Headless channel). Publish the desired products and collections to that storefront. Do not use an Admin API token or a private Storefront token.
2. Copy `.env.example` to `.env` and set both domain and public token:

   ```dotenv
   EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-public-storefront-token
   EXPO_PUBLIC_SHOPIFY_API_VERSION=2026-07
   EXPO_PUBLIC_SHOPIFY_DEALS_COLLECTION=special-deals
   ```

3. Use the `.myshopify.com` hostname without a scheme or path. Keep the pinned API version supported by Shopify; review its version lifecycle before release.
4. Default category collection handles are `hand-dryers`, `paper-towel-dispensers`, `soap-dispensers`, `sanitary-bins`, `baby-change-stations` and `grab-rails`. Override individual handles with the JSON object in `EXPO_PUBLIC_SHOPIFY_CATEGORY_HANDLES` (see `.env.example`). The deals handle is independently configurable.
5. Restart with `npx expo start --clear`. Expo embeds `EXPO_PUBLIC_*` values at bundle time, so changes require a restart/rebuild. The source label changes to **Shopify catalogue**. Missing collections display empty states. Partial configuration or API failures show actionable errors instead of silently falling back to sample prices.

**Every `EXPO_PUBLIC_*` value is visible to app users.** Only public, buyer-facing Storefront credentials belong here. Never use Admin API secrets, private tokens or customer credentials. `.env` files are ignored by Git. The adapter makes read-only GraphQL queries to `https://<store>.myshopify.com/api/<version>/graphql.json` with Australian market context and requires AUD prices. Restricted environments need the exact store hostname and `cdn.shopify.com` for product images. Sample mode needs neither.

The adapter paginates products and collection membership (100 per page, up to 1,000 per connection). A visible notice identifies a truncated catalogue. Search is local to loaded products. Products with more than 100 variants produce an explicit error until nested variant pagination is implemented. Larger stores should use server-side collection/search pagination before production. A product belongs to its first matching configured category; unmapped products remain searchable and can appear in promotional lists.

For multiple variants, the UI selects an available discounted variant first, then the first available variant, then the first variant if sold out. It keeps that variant's ID, price and compare-at price together. There is no variant picker yet.

## Validation

```sh
npm run typecheck
npm test
npm run format:check
npx expo install --check
npm run export:web
npx expo export --platform ios --platform android --output-dir dist-native --max-workers 2
npx playwright install chromium
npm run test:e2e
```

Native exports verify JavaScript/Hermes bundles; they do **not** compile or install native apps. Device testing and a real-store smoke test remain release checks. Unit tests cover selection, discounts, currency, pagination, API failures/cancellation, configuration and cart quantities. Playwright exercises browsing, cart persistence, search, categories, Account and responsive layouts at phone/desktop sizes. Its managed Metro server forces sample mode. Stop other servers on port 8081 before CI runs.

For a read-only cloud home directory, use these CLI overrides without changing `HOME`:

```sh
export EXPO_NO_TELEMETRY=1
export EXPO_OFFLINE=1
export __UNSAFE_EXPO_HOME_DIRECTORY=/workspace/.expo-home
export PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright
```

If Chromium is already installed in the cloud image, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` to use it instead of downloading a browser.

Offline mode uses Expo's SDK-bundled compatibility data; package downloads still need npm access. `.npmrc` keeps npm's cache in ignored `.npm/`. Browser installation needs Playwright's download domains. GitHub Actions runs types, unit tests, formatting, all platform exports and browser tests.

## Project layout

```text
app/                  Expo Router tabs, product and collection routes
src/catalog/          Shared types, sample catalogue, config and Shopify adapter
src/components/       UI primitives, product cards and category icons
src/state/            Catalogue loading and persisted local cart
src/theme.ts          Colours and typography
assets/               Official logo, product photos, website icons and source manifest
tests/                Node unit tests and Playwright browser tests
```

`CatalogService.load()` is the data boundary. `StoreProvider` chooses the service from public configuration. Screens consume normalized products, keeping Shopify fields outside the UI. DM Sans is distributed through `@expo-google-fonts/dm-sans` under its included font license. Icons use Ionicons through Expo. Official brand and product assets are recorded in `assets/sources.json`, including exact source URLs, product names and retrieval date.

## Brand assets and contact

Brand assets were retrieved from [ozwashroom.com.au](https://www.ozwashroom.com.au) on **19 October 2026**. The bundled header/footer PNG is the official `ozwashroom-australia-logo.png`. The website's primary button color **#4146B0** is used for buttons, active tabs and contact links; the verified announcement/category accent **#3773ED** is used for the compact promotional banner. Sources and CSS selectors are recorded in `assets/sources.json`.

The banner remains approximately half its original height: 165 points on phones and 160 on larger screens, with room to expand for accessibility text sizes. Product images use contain sizing so tall dispensers and wide grab rails are visible without cropping. Ten official product names and corresponding photos cover all six sample categories. Photos are bundled and require no image host access in sample mode; missing or failed live images retain the neutral fallback. Sample prices, discounts, availability and arrival dates remain illustrative, with visible notices on browsing, product and cart screens. These are preview fixtures, not a snapshot of current store offers.

The official website phone **1300 652 715**, confirmed by the owner, appears under the header and opens `tel:1300652715`. Optional public overrides are documented in `.env.example`: `EXPO_PUBLIC_BRAND_LOGO_URL` (PNG/JPEG), `EXPO_PUBLIC_CONTACT_PHONE` and `EXPO_PUBLIC_CONTACT_URL`. Restart Metro after changing them. If a remote logo fails, the bundled official logo appears.

The website's official favicon replaces the invented prototype icon. Its source is only **32×32 pixels**, even when a larger size is requested from Shopify; a high-resolution square brand asset is still needed for final app-store launcher artwork. Header and product assets are used at their original aspect ratios. Images remain the property of their respective owners.
