import { test, expect } from '@playwright/test';
import sources from '../../assets/sources.json';

test('home promotions, category views, search and persistent cart work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByText('Sample catalogue · Official photos, illustrative AUD prices'),
  ).toBeVisible();
  for (const name of ['Special Deals', 'New Arrivals', 'Discounted Products', 'Shop by Category']) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await page.getByRole('link', { name: 'View all Special Deals' }).click();
  await expect(page.getByText('4 essentials', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /View Vortex Hand Dryer – Super Quiet Motor/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Vortex Hand Dryer – Super Quiet Motor | 3-Year Warranty' }),
  ).toBeVisible();
  await expect(page.getByText('Save 24% · $80.00 less')).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await page.getByRole('button', { name: 'View cart', exact: true }).click();
  await expect(page.getByText('Sample subtotal', { exact: true })).toBeVisible();
  await page
    .getByRole('button', {
      name: 'Increase quantity of Vortex Hand Dryer – Super Quiet Motor | 3-Year Warranty',
    })
    .click();
  await expect(page.getByText('$498.00 AUD', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('$498.00 AUD', { exact: true })).toBeVisible();
  await page
    .getByRole('button', {
      name: 'Decrease quantity of Vortex Hand Dryer – Super Quiet Motor | 3-Year Warranty',
    })
    .click();
  await page
    .getByRole('button', {
      name: 'Decrease quantity of Vortex Hand Dryer – Super Quiet Motor | 3-Year Warranty',
    })
    .click();
  await expect(page.getByText('A fresh start for your space')).toBeVisible();
  await page.getByRole('link', { name: 'Search products', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search products' }).fill('soap');
  await expect(page.getByText('2 results for “soap”')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search products' }).fill('not-a-real-product');
  await expect(page.getByText('No matches just yet')).toBeVisible();
  await page.getByRole('link', { name: 'Ozwashroom home' }).click();
  await page.getByRole('link', { name: 'View all categories' }).click();
  await expect(page.getByText('Find the right finishing touches for your space.')).toBeVisible();
  await page.getByRole('link', { name: 'Shop Baby Change Stations' }).click();
  await expect(page.getByText('1 essential', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /View Kanga Kare Baby Change Station Grey with Braille/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('home fits the viewport and account explains the v1 boundary', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Special Deals', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Call Ozwashroom on 1300 652 725' })).toBeVisible();
  const banner = await page.getByTestId('home-promo-banner').boundingBox();
  expect(banner?.height).toBeLessThanOrEqual(170);
  const logo = page.getByRole('img', { name: 'Ozwashroom logo', exact: true }).first();
  await expect(logo).toBeVisible();
  const photo = page
    .getByRole('img', {
      name: 'Vortex Hand Dryer – Super Quiet Motor | 3-Year Warranty',
      exact: true,
    })
    .first();
  await expect(photo).toBeVisible();
  for (const image of [logo, photo]) {
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  }
  await expect(page.getByText('Photo coming soon')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('tab', { name: 'Account' }).click();
  await expect(page.getByText('Good to see you here')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Visit Ozwashroom website' })).toBeVisible();
});

test('official branding and all ten product photos load without external services', async ({
  page,
}, testInfo) => {
  const externalRequests: string[] = [];
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (
      ['http:', 'https:'].includes(url.protocol) &&
      !['127.0.0.1', 'localhost'].includes(url.hostname)
    ) {
      externalRequests.push(url.href);
      await route.abort();
    } else {
      await route.continue();
    }
  });
  if (testInfo.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/collection/new');
  await expect(page.getByText('10 essentials', { exact: true })).toBeVisible();
  for (const photo of sources.products) {
    const image = page.getByRole('img', { name: photo.title, exact: true });
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  }
  await expect(page.getByRole('img', { name: 'Ozwashroom logo', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: `test-results/official-catalogue-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('link', { name: /View Vortex Hand Dryer – Super Quiet Motor/ }).click();
  await expect(page.getByRole('heading', { name: sources.products[0]!.title })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(externalRequests).toEqual([]);
});
