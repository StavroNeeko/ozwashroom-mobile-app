import { expect, Page, test } from '@playwright/test';

const checkoutUrl = 'https://example.myshopify.com/cart/c/test-checkout';
function deferredCheckout() {
  let resolve!: () => void;
  const wait = new Promise<void>((done) => {
    resolve = done;
  });
  // Release intercepted requests even if an earlier assertion fails, so teardown cannot hang.
  const timer = setTimeout(() => resolve(), 15000);
  return {
    wait,
    release: () => {
      clearTimeout(timer);
      resolve();
    },
  };
}

const connection = <T>(nodes: T[]) => ({
  nodes,
  pageInfo: { hasNextPage: false, endCursor: null },
});
const products = ['Checkout hand dryer', 'Checkout soap dispenser'].map((title, index) => ({
  id: `product-${index + 1}`,
  handle: `product-${index + 1}`,
  title,
  description: 'Checkout fixture',
  createdAt: '2026-10-20T00:00:00Z',
  featuredImage: null,
  images: connection([]),
  variants: connection([
    {
      id: `gid://shopify/ProductVariant/${101 + index}`,
      availableForSale: true,
      image: null,
      price: { amount: index ? '10.00' : '25.00', currencyCode: 'AUD' },
      compareAtPrice: null,
    },
  ]),
}));
type Input = {
  lines: { merchandiseId: string; quantity: number }[];
  buyerIdentity: { countryCode: string };
};
const successfulCheckout = (input: Input) => ({
  cartCreate: {
    userErrors: [],
    warnings: [],
    cart: {
      checkoutUrl,
      cost: { subtotalAmount: { currencyCode: 'AUD' } },
      lines: connection(
        input.lines.map((line) => ({
          merchandise: { id: line.merchandiseId },
          quantity: line.quantity,
        })),
      ),
    },
  },
});

async function setup(page: Page, checkout: (input: Input) => Promise<unknown>) {
  await page.route('https://example.myshopify.com/api/**', async (route) => {
    const body = route.request().postDataJSON();
    const data = body.query.includes('mutation CreateCheckout')
      ? await checkout(body.variables.input)
      : body.query.includes('query Products')
        ? { products: connection(products) }
        : { collection: { products: connection(products.map(({ id }) => ({ id }))) } };
    await route.fulfill({ json: { data } }).catch(() => {
      /* A navigation cancellation may have aborted this request. */
    });
  });
  await page.route(checkoutUrl, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Shopify checkout test destination</h1>' }),
  );
}
async function add(page: Page, index: number) {
  await page.goto(`/product/product-${index}`);
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await page.getByRole('button', { name: 'View cart', exact: true }).click();
}

test('checkout sends exact quantities once, opens the hosted page and preserves the cart on return', async ({
  page,
}) => {
  let calls = 0;
  let submitted: Input | undefined;
  const { wait: gate, release } = deferredCheckout();
  await setup(page, async (input) => {
    calls++;
    submitted = input;
    await gate;
    return successfulCheckout(input);
  });
  await add(page, 1);
  await page.getByRole('button', { name: 'Increase quantity of Checkout hand dryer' }).click();
  await add(page, 2);
  await expect(page.getByText('$60.00 AUD', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Checkout with Shopify', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Preparing checkout…', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Increase quantity of Checkout hand dryer' }),
  ).toBeDisabled();
  await expect.poll(() => calls).toBe(1);
  expect(submitted).toEqual({
    lines: [
      { merchandiseId: 'gid://shopify/ProductVariant/101', quantity: 2 },
      { merchandiseId: 'gid://shopify/ProductVariant/102', quantity: 1 },
    ],
    buyerIdentity: { countryCode: 'AU' },
  });
  release();
  await expect(page).toHaveURL(checkoutUrl);
  await expect(
    page.getByRole('heading', { name: 'Shopify checkout test destination' }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByText('$60.00 AUD', { exact: true })).toBeVisible();
  expect(calls).toBe(1);
});

test('Shopify errors keep the cart available for review and retry', async ({ page }) => {
  let calls = 0;
  await setup(page, async (input) =>
    ++calls === 1
      ? {
          cartCreate: {
            cart: null,
            userErrors: [{ message: 'This product is sold out.' }],
            warnings: [],
          },
        }
      : successfulCheckout(input),
  );
  await add(page, 1);
  await page.getByRole('button', { name: 'Checkout with Shopify', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('This product is sold out.');
  await expect(page.getByText('$25.00 AUD', { exact: true }).last()).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Checkout with Shopify', exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Refresh products', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Checkout with Shopify', exact: true }).click();
  await expect(page).toHaveURL(checkoutUrl);
  expect(calls).toBe(2);
});

test('leaving the cart cancels a pending checkout instead of opening it later', async ({
  page,
}) => {
  let received = false;
  const { wait: gate, release } = deferredCheckout();
  await setup(page, async (input) => {
    received = true;
    await gate;
    return successfulCheckout(input);
  });
  await add(page, 1);
  await page.getByRole('button', { name: 'Checkout with Shopify', exact: true }).click();
  await expect.poll(() => received).toBe(true);
  await page.getByRole('tab', { name: /Search$/ }).click();
  release();
  await expect(page).toHaveURL(/\/search$/);
  await page.getByRole('tab', { name: /Cart$/ }).click();
  await expect(
    page.getByRole('button', { name: 'Checkout with Shopify', exact: true }),
  ).toBeEnabled();
  await expect(page.getByText('$25.00 AUD', { exact: true }).last()).toBeVisible();
});
