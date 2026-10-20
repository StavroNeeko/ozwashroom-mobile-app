import { test } from 'node:test';
import assert from 'node:assert/strict';
import { androidReleaseIssues } from '../scripts/android-release-config';

const valid = {
  profile: 'production',
  projectId: 'a1234567-1234-1234-1234-123456789abc',
  packageName: 'com.ozwashroom.mobile',
  shopifyDomain: 'ozwashroom.myshopify.com',
  hasPublicToken: true,
  icon: { width: 1024, height: 1024 },
};

test('production builds require linked Expo identity, live store and token, and a square release-size icon', () => {
  assert.deepEqual(androidReleaseIssues(valid), []);
  const missing = androidReleaseIssues({
    ...valid,
    projectId: undefined,
    hasPublicToken: false,
    icon: { width: 32, height: 32 },
  });
  assert.equal(missing.length, 3);
  assert.ok(missing.some((issue) => issue.includes('Expo account')));
  assert.ok(missing.some((issue) => issue.includes('Storefront token')));
  assert.ok(missing.some((issue) => issue.includes('1024')));
});

test('preview can use the website icon but cannot silently ship demo or wrong-store settings', () => {
  assert.deepEqual(
    androidReleaseIssues({ ...valid, profile: 'preview', icon: { width: 32, height: 32 } }),
    [],
  );
  assert.ok(
    androidReleaseIssues({
      ...valid,
      profile: 'preview',
      shopifyDomain: 'example.myshopify.com',
    }).some((issue) => issue.includes('Ozwashroom')),
  );
  assert.ok(
    androidReleaseIssues({ ...valid, icon: { width: 300, height: 57 } }).some((issue) =>
      issue.includes('square'),
    ),
  );
  assert.ok(
    androidReleaseIssues({ ...valid, packageName: 'not a package' }).some((issue) =>
      issue.includes('identifier'),
    ),
  );
  assert.ok(
    androidReleaseIssues({ ...valid, profile: 'unknown' }).some((issue) =>
      issue.includes('profile'),
    ),
  );
});
