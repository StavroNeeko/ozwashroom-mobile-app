# Android release setup

The app has been exercised through Expo Go on Android, including a real Shopify order reported successful by the owner. The next step is a **standalone signed APK**, then an **Android App Bundle (AAB)** for Google Play. These build profiles do not upload an app to Google Play or publish a store release.

## Current setup gaps

- Create an [Expo account](https://expo.dev/signup), then link this repository to an Expo project owned by the business.
- Configure the same live Shopify variables used in the local `.env` in EAS's **preview** and **production** environments. Local `.env` files are excluded from build uploads.
- Replace `assets/icon.png` with approved square brand artwork of at least **1024×1024** before a production build. The current official website favicon is **32×32**. It is permitted for an internal preview but blocked for production. Do not upscale the favicon and treat it as high-resolution artwork.
- Before the first Google Play upload, confirm that **`com.ozwashroom.mobile`** is the business's intended application ID. It is preserved from the existing project; this preparation has not registered it or checked its availability in Play Console.

## 1. Sign in and link the Expo project

In the project folder on the owner's Mac:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
```

Use the business's Expo account or organization. Follow the prompts to create/link its project. EAS writes the real project ID to `extra.eas.projectId` in `app.json`; this repository does not contain an invented project ID. Keep that change for subsequent builds and commit the non-secret project metadata when ready. Never share the Expo password in chat.

## 2. Configure cloud build variables

After signing in and linking the project, copy the app's existing local `.env` settings to both EAS environments:

```sh
npx eas-cli@latest env:push --environment preview --path .env
npx eas-cli@latest env:push --environment production --path .env
```

Review the selected project/environment and visibility prompts. These are public mobile-app settings: Expo bundles `EXPO_PUBLIC_*` values into the app. Use only the **public Storefront API token**, never an Admin API/private Storefront token. If the CLI does not show a needed value, use the Expo project dashboard's Environment variables page to set it for the corresponding environment.

Required live values are the Ozwashroom Shopify domain and public token. Preserve the API version, collection mappings and contact values from the working `.env`; `shopify.env.example` documents the mapping. This prevents a cloud-built app from unexpectedly falling back to demo products. The preview APK uses the live store and can place real orders when the buyer completes checkout.

## 3. Create an installable preview APK

```sh
npm run android:release:check -- --profile preview
npm run android:preview
```

EAS will request Android signing credentials. For a new app, choose EAS-managed credentials and generate a keystore when prompted; for an existing app, use its existing credentials. Retain access to those credentials in the business's Expo account. Do not commit keystores, credential JSON or service-account files.

When the build succeeds, EAS provides an install/download link. Open that link on Android and install the **APK**. This runs without Expo Go or a Mac development server and will not show Expo Go's floating Tools button. An AAB cannot be directly installed this way.

Check product photos, all categories, search, quantity controls, persisted cart, tap-to-call, browser checkout handoff and return. Verify the production-candidate APK on the actual Android devices that will be supported. Expo Go and JavaScript bundle exports are not substitutes for testing this installed APK.

## 4. Build the Google Play AAB

After adding the approved icon and confirming the application ID:

```sh
npm run android:release:check -- --profile production
npm run android:production
```

EAS uses the `production` environment and remote Android build version management with automatic version-code increments. The existing `versionCode: 1` is the initial local value; EAS owns subsequent production build numbers. The app's user-facing version is currently **1.0.0**.

The local commands and EAS Android post-install hook validate account linking, package syntax, live store settings and icon dimensions. They do not verify token validity, project ownership, signing success, full image decoding, payment readiness or Play approval. Complete the installed-device and live-catalogue checks after a successful signed build.

## 5. Prepare the Google Play internal release

Use the business's Google Play developer account to create the app record. Review and merge PRs #3 and #4 and this release preparation before selecting a production source revision. Upload the signed AAB to an **internal testing** track first; no automatic submit profile or service account is configured here. Follow Play Console's account-specific testing and production-access requirements.

Use the [store listing draft](android-store-listing.md) as editable copy. Provide the final store icon, feature graphic and screenshots of the standalone build. Complete Play Console's privacy, Data safety, content-rating, audience and contact information using the actual release build and the business's practices. The existing [website privacy policy](https://www.ozwashroom.com.au/policies/privacy-policy) is reachable; its applicability to this app still needs business review.

The app stores cart variant IDs/quantities locally and sends those selections to Shopify for checkout. Contact, shipping and payment information are entered in the external Shopify checkout. Account sign-in, in-app order history and payment-success detection are not implemented. These facts help the owner review the listing and disclosures; this guide does not assert completed privacy declarations or store approval.

## Build profiles and sources

| Profile      | Artifact | EAS environment | Purpose                                 |
| ------------ | -------- | --------------- | --------------------------------------- |
| `preview`    | APK      | `preview`       | Direct Android installation for testing |
| `production` | AAB      | `production`    | Google Play upload                      |

Both use Node 24.19.0, matching the validation runtime. No development-client dependency is needed for these standalone release-mode builds. iPhone support remains unverified and is outside this Android release preparation.

Sources: [Expo build setup](https://docs.expo.dev/build/setup/), [APK builds](https://docs.expo.dev/build-reference/apk/), [EAS configuration](https://docs.expo.dev/eas/json/), [environment management](https://docs.expo.dev/eas/environment-variables/manage/), [Android version management](https://docs.expo.dev/build-reference/app-versions/), [Google Play submission](https://docs.expo.dev/submit/android/).
