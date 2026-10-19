import { test, expect } from '@playwright/test';

test('home promotions, category views, search and persistent cart work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByText('Sample catalogue · Illustrative products & AUD prices'),
  ).toBeVisible();
  for (const name of ['Special Deals', 'New Arrivals', 'Discounted Products', 'Shop by Category']) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await page.getByRole('link', { name: 'View all Special Deals' }).click();
  await expect(page.getByText('4 essentials', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /View Airflow Compact Hand Dryer/ }).click();
  await expect(page.getByRole('heading', { name: 'Airflow Compact Hand Dryer' })).toBeVisible();
  await expect(page.getByText('Save 24% · $80.00 less')).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await page.getByRole('button', { name: 'View cart', exact: true }).click();
  await expect(page.getByText('Sample subtotal', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Increase quantity of Airflow Compact Hand Dryer' })
    .click();
  await expect(page.getByText('$498.00 AUD', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('$498.00 AUD', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Decrease quantity of Airflow Compact Hand Dryer' })
    .click();
  await page
    .getByRole('button', { name: 'Decrease quantity of Airflow Compact Hand Dryer' })
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
    page.getByRole('link', { name: /View Fold-down Baby Change Station/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('home fits the viewport and account explains the v1 boundary', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Special Deals', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('tab', { name: 'Account' }).click();
  await expect(page.getByText('Good to see you here')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Visit Ozwashroom website' })).toBeVisible();
});
