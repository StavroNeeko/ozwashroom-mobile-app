import fs from 'node:fs';
import path from 'node:path';
import { getConfig } from 'expo/config';
import { readShopifyConfig } from '../src/catalog/config';
import { androidReleaseIssues } from './android-release-config';

if (process.env.EAS_BUILD_PLATFORM && process.env.EAS_BUILD_PLATFORM !== 'android') {
  console.log('Android release check skipped for another platform.');
  process.exit(0);
}

const root = path.resolve(import.meta.dirname, '..');
// Local builds can use the owner's ignored .env. Remote EAS builds use their selected environment.
if (!process.env.EAS_BUILD && fs.existsSync(path.join(root, '.env')))
  process.loadEnvFile(path.join(root, '.env'));
const args = process.argv.slice(2);
const profileIndex = args.indexOf('--profile');
const profile =
  profileIndex >= 0
    ? (args[profileIndex + 1] ?? '')
    : (process.env.EAS_BUILD_PROFILE ?? 'production');
const app = getConfig(root).exp;
const issues: string[] = [];
let shopify: ReturnType<typeof readShopifyConfig> = null;
try {
  shopify = readShopifyConfig();
} catch {
  issues.push(
    'The Shopify configuration is incomplete or invalid. Review the selected environment variables.',
  );
}
let icon: { width: number; height: number } | undefined;
try {
  const iconPath = app.android?.icon ?? app.icon;
  if (!iconPath) throw new Error('No icon configured.');
  const data = fs.readFileSync(path.resolve(root, iconPath));
  if (
    data.length >= 24 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    icon = { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
} catch {
  // The issue below gives an actionable message rather than a raw filesystem error.
}
issues.push(
  ...androidReleaseIssues({
    profile,
    projectId: app.extra?.eas?.projectId,
    packageName: app.android?.package,
    shopifyDomain: shopify?.domain,
    hasPublicToken: !!shopify?.token,
    icon,
  }),
);
if (issues.length) {
  console.error(`Android ${profile || '(unspecified)'} build needs setup:`);
  for (const issue of new Set(issues)) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `Android ${profile} configuration checks passed. This does not build, sign or publish the app.`,
  );
  if (profile === 'preview' && icon && icon.width < 1024)
    console.log('Preview uses the small website icon. Replace it before production.');
}
