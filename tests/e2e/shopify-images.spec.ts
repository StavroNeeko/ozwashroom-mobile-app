import path from 'node:path';
import { expect, test } from '@playwright/test';

const photo = (name: string) => ({ url: `https://cdn.shopify.com/${name}.png`, altText: null });
const connection = <T>(nodes: T[]) => ({
  nodes,
  pageInfo: { hasNextPage: false, endCursor: null },
});
const products = [
  {
    id: 'gallery',
    title: 'Gallery-only dispenser',
    featuredImage: null,
    images: [photo('gallery')],
  },
  {
    id: 'broken',
    title: 'Broken featured dryer',
    featuredImage: photo('broken'),
    images: [photo('broken'), photo('backup')],
  },
  { id: 'missing', title: 'Product without photography', featuredImage: null, images: [] },
].map((item) => ({
  ...item,
  handle: item.id,
  description: 'Shopify image regression fixture',
  createdAt: '2026-10-20T00:00:00Z',
  images: connection(item.images),
  variants: connection([
    {
      id: `variant-${item.id}`,
      availableForSale: true,
      image: null,
      price: { amount: '100.00', currencyCode: 'AUD' },
      compareAtPrice: { amount: '120.00', currencyCode: 'AUD' },
    },
  ]),
}));

test('Shopify promotion photos use galleries, recover from failed featured images and retain honest placeholders', async ({
  page,
}) => {
  const imageRequests: string[] = [];
  await page.route('https://example.myshopify.com/api/**', async (route) => {
    const request = route.request().postDataJSON();
    const data = request.query.includes('query Products')
      ? { products: connection(products) }
      : {
          collection: {
            products: connection(
              ['test-deals', 'hand-dryers'].includes(request.variables.handle)
                ? products.slice(0, 2).map(({ id }) => ({ id }))
                : [],
            ),
          },
        };
    await route.fulfill({ json: { data } });
  });
  await page.route('https://cdn.shopify.com/**', async (route) => {
    imageRequests.push(route.request().url());
    if (route.request().url().endsWith('/broken.png')) {
      await route.fulfill({ status: 404, body: 'Image unavailable' });
    } else {
      await route.fulfill({
        path: path.resolve('assets/products/dryer-01.png'),
        contentType: 'image/png',
      });
    }
  });

  await page.goto('/');
  await expect(page.getByText('Shopify catalogue · Prices in AUD')).toBeVisible();
  // These two products appear in Deals, New Arrivals and Discounted Products.
  for (const name of ['Gallery-only dispenser', 'Broken featured dryer']) {
    const images = page.getByRole('img', { name, exact: true });
    await expect(images).toHaveCount(3);
    for (const image of await images.all()) {
      await expect
        .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
        .toBeGreaterThan(0);
    }
  }
  expect(imageRequests).toContain('https://cdn.shopify.com/broken.png');
  expect(imageRequests).toContain('https://cdn.shopify.com/backup.png');
  await expect(page.getByText('Photo coming soon').first()).toBeVisible();

  await page.getByRole('link', { name: 'View all Special Deals', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Special Deals', exact: true })).toBeVisible();
  await page.getByRole('link', { name: /View Broken featured dryer/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Broken featured dryer', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Broken featured dryer', exact: true })
        .evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
});
