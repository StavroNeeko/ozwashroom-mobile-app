import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShopifyCheckout, CheckoutLine } from '../src/checkout/shopify';
import { ShopifyConfig } from '../src/catalog/config';

const config: ShopifyConfig = {
  domain: 'example.myshopify.com',
  token: 'public-test-token',
  apiVersion: '2026-07',
  dealsHandle: 'deals',
  categoryHandles: {},
};
const lines: CheckoutLine[] = [
  { merchandiseId: 'gid://shopify/ProductVariant/101', quantity: 2 },
  { merchandiseId: 'gid://shopify/ProductVariant/102', quantity: 1 },
];
const url = 'https://www.ozwashroom.com.au/cart/c/test-checkout';
function payload() {
  return {
    cartCreate: {
      userErrors: [] as { message: string }[],
      warnings: [] as { message: string }[],
      cart: {
        checkoutUrl: url,
        cost: { subtotalAmount: { currencyCode: 'AUD' } },
        lines: {
          nodes: lines
            .map((line) => ({ quantity: line.quantity, merchandise: { id: line.merchandiseId } }))
            .reverse(),
          pageInfo: { hasNextPage: false },
        },
      },
    },
  };
}
const response = (data = payload()) => new Response(JSON.stringify({ data }));

test('checkout sends exact variant quantities with Australian context and returns the hosted URL', async () => {
  const result = await createShopifyCheckout(
    config,
    lines,
    undefined,
    async (endpoint, options) => {
      assert.equal(endpoint, 'https://example.myshopify.com/api/2026-07/graphql.json');
      assert.equal(
        (options?.headers as Record<string, string>)['X-Shopify-Storefront-Access-Token'],
        config.token,
      );
      const body = JSON.parse(options?.body as string);
      assert.match(body.query, /mutation CreateCheckout/);
      assert.match(body.query, /@inContext\(country: AU\)/);
      assert.deepEqual(body.variables, { input: { lines, buyerIdentity: { countryCode: 'AU' } } });
      return response();
    },
  );
  assert.equal(result, url);
});

test('checkout rejects samples, invalid quantities, empty or duplicate lines before making a request', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    return response();
  };
  const invalid = [
    [],
    [{ merchandiseId: 'sample-variant-dryer-01', quantity: 1 }],
    [{ ...lines[0]!, quantity: 0 }],
    [{ ...lines[0]!, quantity: 100 }],
    [{ ...lines[0]!, quantity: 1.5 }],
    [lines[0]!, lines[0]!],
    Array.from({ length: 251 }, (_, i) => ({
      merchandiseId: `gid://shopify/ProductVariant/${i + 1}`,
      quantity: 1,
    })),
  ];
  for (const value of invalid)
    await assert.rejects(
      createShopifyCheckout(config, value, undefined, fetcher),
      /Review your cart/,
    );
  assert.equal(calls, 0);
});

test('Shopify errors and warnings do not hand off to payment', async () => {
  const error = payload();
  error.cartCreate.userErrors = [{ message: 'Item is unavailable.' }];
  await assert.rejects(
    createShopifyCheckout(config, lines, undefined, async () => response(error)),
    /unavailable/,
  );
  const warning = payload();
  warning.cartCreate.warnings = [{ message: 'Quantity was reduced.' }];
  await assert.rejects(
    createShopifyCheckout(config, lines, undefined, async () => response(warning)),
    /Refresh products/,
  );
});

test('checkout refuses changed or incomplete cart quantities and non-AUD totals', async () => {
  for (const change of [
    (data: ReturnType<typeof payload>) => {
      data.cartCreate.cart.lines.nodes.pop();
    },
    (data: ReturnType<typeof payload>) => {
      data.cartCreate.cart.lines.nodes[0]!.quantity = 9;
    },
    (data: ReturnType<typeof payload>) => {
      data.cartCreate.cart.lines.pageInfo.hasNextPage = true;
    },
    (data: ReturnType<typeof payload>) => {
      data.cartCreate.cart.cost.subtotalAmount.currencyCode = 'USD';
    },
  ]) {
    const data = payload();
    change(data);
    await assert.rejects(
      createShopifyCheckout(config, lines, undefined, async () => response(data)),
      /quantities changed|complete checkout|AUD/,
    );
  }
});

test('only HTTPS checkout URLs on the configured store or approved Shopify/Ozwashroom hosts are opened', async () => {
  for (const link of [
    'javascript:alert(1)',
    'http://www.ozwashroom.com.au/checkout',
    'https://www.ozwashroom.com.au.evil.example/checkout',
    'https://user:pass@www.ozwashroom.com.au/checkout',
    'https://www.ozwashroom.com.au:8443/checkout',
    'not a URL',
  ]) {
    const data = payload();
    data.cartCreate.cart.checkoutUrl = link;
    await assert.rejects(
      createShopifyCheckout(config, lines, undefined, async () => response(data)),
      /checkout link/,
    );
  }
});

test('checkout surfaces HTTP/GraphQL errors and propagates caller cancellation', async () => {
  await assert.rejects(
    createShopifyCheckout(config, lines, undefined, async () => new Response('', { status: 401 })),
    /401/,
  );
  await assert.rejects(
    createShopifyCheckout(
      config,
      lines,
      undefined,
      async () => new Response(JSON.stringify({ errors: [{ message: 'Access denied' }] })),
    ),
    /permissions/,
  );
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    createShopifyCheckout(config, lines, abort.signal, async (_, options) => {
      assert.equal(options?.signal?.aborted, true);
      throw new DOMException('Aborted', 'AbortError');
    }),
    /Aborted/,
  );
});
