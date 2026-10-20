# Android release setup

The app has been exercised through Expo Go on Android, including a real Shopify order reported successful by the owner. The next step is a **standalone signed APK**, then an **Android App Bundle (AAB)** for Google Play. These build profiles do not upload an app to Google Play or publish a store release.

## Current release setup

- The owner created the Expo account, linked project `9ed21a6b-4187-4a63-995e-5562689020c0`, built a preview APK and confirmed that it runs independently on Android. `app.config.ts` provides that real project ID to fresh checkouts and preserves existing local project metadata.
- The owner uploaded the working Shopify settings to EAS **preview**. Configure/verify them separately in **production** before its build. Local `.env` files are excluded from build uploads.
- Prepared launcher artwork is now **1024×1024**, adapted from the owner-supplied water-splash logo. Android has a safe-area adaptive foreground; the store icon and feature graphic are in `assets/store/`. Review the artwork and test its masking on an installed APK before Play submission.
- Before the first Google Play upload, confirm that **`com.ozwashroom.mobile`** is the business's intended application ID. It is preserved from the existing project; this preparation has not registered it or checked its availability in Play Console.

## 1. Sign in and confirm the linked Expo project

In the project folder on the owner's Mac:

```sh
npx eas-cli@latest login
npx eas-cli@latest project:info
```

Use the business's Expo account or organization. Confirm that the project information identifies the existing Ozwashroom project, not a new project. This app is already linked through the owner-confirmed ID in `app.config.ts`; existing local `extra.eas.projectId` metadata in `app.json` is preserved. Do not initialize a different project for a normal subsequent build. Keep any local linkage changes. Never share the Expo password in chat.

## 2. Configure cloud build variables

After signing in and linking the project, create a temporary copy that omits blank assignments, then upload its settings to both EAS environments. EAS rejects empty variable values; the optional `EXPO_PUBLIC_BRAND_LOGO_URL=` line should be omitted because the app already bundles its logo. These commands leave the original `.env` unchanged:

```sh
sed '/^[A-Za-z_][A-Za-z0-9_]*=[[:space:]]*$/d' .env > .env.eas
npx eas-cli@latest env:push --environment preview --path .env.eas
npx eas-cli@latest env:push --environment production --path .env.eas
rm .env.eas
```

Run each command separately. Remove `.env.eas` after both uploads succeed. If an earlier upload created some variables before failing, review the replacement prompts for the same names; retain the intended current values.

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

After reviewing the prepared artwork, configuring the production environment and confirming the application ID:

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

Both use Node 24.19.0, matching the validation runtime. The release check reads resolved Expo configuration, including `app.config.ts` and local static metadata. No development-client dependency is needed for these standalone release-mode builds. iPhone support remains unverified and is outside this Android release preparation.

Sources: [Expo build setup](https://docs.expo.dev/build/setup/), [APK builds](https://docs.expo.dev/build-reference/apk/), [EAS configuration](https://docs.expo.dev/eas/json/), [environment management](https://docs.expo.dev/eas/environment-variables/manage/), [Android version management](https://docs.expo.dev/build-reference/app-versions/), [Google Play submission](https://docs.expo.dev/submit/android/).
