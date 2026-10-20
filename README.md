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

**Live carts can open Shopify hosted checkout.** Customers enter their delivery and payment details on Shopify; the app does not collect card details. Customer login and order history are not implemented. The app creates a Shopify cart only when the buyer presses Checkout; Shopify creates the order when the buyer completes checkout. Sample and Shopify carts use separate storage keys. Stored variant IDs and quantities are reconciled with current prices and availability on launch/refresh.

## Connect Shopify Storefront

For Ozwashroom, `shopify.env.example` provides the verified store domain and collection mappings. Copy it to your local `.env`, enter your **public Storefront API token**, then restart Expo with `npx expo start --clear`. Do not start with the token blank: a partially configured live connection shows a configuration error instead of demo prices.

In Shopify admin, add/open the **Headless** sales channel, choose **Create storefront** (for example, “Ozwashroom mobile”), then use **Manage API access → Storefront API → Manage** to find the **public access token**. Enable product/collection read access and publish the products and collections you want to that storefront. See [Shopify's public-token setup](https://shopify.dev/docs/api/storefront-web-components/getting-started). Private tokens and Admin API tokens do not belong in this mobile app.

The website identifies the store as `ozwashroom.myshopify.com`. Public collections were checked on 19 October 2026: baby change stations use `baby-change-table`, grab rails use `grab-rail`, and the populated Flash Sale collection uses `flash-sale-1` (`flash-sale` is empty). The live template includes these mappings. Public website visibility does not establish Headless-channel availability; verify that publication separately. You can change the deals collection handle in `.env` to choose a different collection for Special Deals.

Once connected, Shopify controls product names, images, selling/compare-at prices and availability. Home pull-to-refresh or reopening the app reloads the catalogue; API configuration and collection mapping changes require an Expo restart/rebuild. Live carts support Shopify hosted checkout; sample carts cannot place orders.

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

**Every `EXPO_PUBLIC_*` value is visible to app users.** Only public, buyer-facing Storefront credentials belong here. Never use Admin API secrets, private tokens or customer credentials. `.env` files are ignored by Git. Catalogue loading uses read-only GraphQL queries; checkout uses a buyer-initiated `cartCreate` mutation against `https://<store>.myshopify.com/api/<version>/graphql.json` with Australian market context and requires AUD prices. Restricted environments need the exact store hostname and `cdn.shopify.com` for product images. Sample mode needs neither.

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
npm run test:e2e:shopify
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

The launcher and favicon now use artwork adapted from the owner's supplied water-splash logo. `assets/icon.png` is 1024×1024; Android uses a separately padded adaptive foreground on white. Google Play's 512×512 icon and 1024×500 feature graphic are in `assets/store/`. Prepared masters and provenance are recorded in `assets/brand/` and `assets/sources.json`. The website header logo and product photos retain their original sources. Images remain the property of their respective owners.

## Live product image handling

Shopify image requests are bounded to 800×800 pixels and prefer JPEG for mobile compatibility. Each product keeps its featured image, its selected variant image and up to three gallery images as ordered, deduplicated candidates. If a download fails, the UI tries the next candidate; products with no working image retain the neutral placeholder. A refreshed product can retry its image downloads. This applies to Special Deals, New Arrivals, category grids, details and the cart.

`npm run test:e2e:shopify` runs phone/desktop browser regressions against intercepted Shopify responses on port 8082. It uses a dummy public token and local image fixtures, not the live store. It covers missing featured images, failed downloads with a gallery backup, products without photography, and hosted checkout handoff/error/cancellation behavior; the regular sample browser suite remains on port 8081. Real-device and live-catalogue verification remain separate checks.

## Shopify hosted checkout

With a live catalogue, the cart offers **Checkout with Shopify**. It sends the selected Shopify variant IDs and quantities with Australian buyer context to the [Storefront Cart API](https://shopify.dev/docs/api/storefront/2026-07/mutations/cartCreate), then opens Shopify’s returned checkout URL in the phone’s browser (same tab on web). Shopify confirms final prices, shipping, tax, inventory and available payment methods. Its checkout handles delivery and payment details; no card details pass through this app.

Checkout is hidden in sample mode. The app validates live variant IDs and quantities, prevents repeated in-flight submissions, and cancels a pending handoff if the buyer leaves the cart or its contents change. Shopify user errors, warnings, changed/missing quantities, non-AUD totals and invalid or unexpected checkout hosts block the handoff and leave the cart available to review or retry. Approved hosts are the configured `.myshopify.com` store, `ozwashroom.com.au`, `www.ozwashroom.com.au` and `checkout.shopify.com`. If the store changes its checkout domain, review that allowlist before release.

Opening checkout preserves the local cart because returning to the app does not prove payment succeeded. Buyers can remove saved items with the cart controls after ordering. There is no in-app payment-success screen, automatic cart clearing, payment callback, customer sign-in or order history. Reopening checkout after returning creates a new Shopify cart; local/server cart synchronization and saved checkout-session recovery are not implemented.

The existing public Storefront token must permit cart creation; Shopify payments, shipping and market settings must be configured on the store. Test on iPhone and Android with the actual Headless token. In a development/test store or coordinated Shopify test-payment session, verify quantities, AUD totals, shipping/tax, payment completion/cancellation and browser return before launch. Automated checks use intercepted API responses and never place live orders or make payments.

## Android release builds

See [Android release setup](docs/android-release.md) for account linking, cloud environment configuration, the standalone APK and Google Play AAB commands. `npm run android:release:check` reports missing setup without printing token values. Both local build commands and the EAS Android post-install hook require a linked Expo project and live Ozwashroom configuration. Production also requires a square PNG icon at least 1024×1024; the prepared water-splash icon meets that size check. The owner-confirmed Expo project ID is supplied through `app.config.ts`, preserving any project metadata already present in local `app.json`.

A successful JavaScript export is not a signed Android build. No EAS project, signing key or Play Store submission is created by adding these configuration files.
