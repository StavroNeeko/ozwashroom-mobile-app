import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShopifyService, normalizeProduct } from '../src/catalog/shopify';
import { readShopifyConfig, ShopifyConfig } from '../src/catalog/config';

const config: ShopifyConfig = {
  domain: 'example.myshopify.com',
  token: 'public-test-token',
  apiVersion: '2026-07',
  dealsHandle: 'our-deals',
  categoryHandles: { 'hand-dryers': 'electric-dryers' },
};
const variant = {
  id: 'variant-1',
  availableForSale: true,
  price: { amount: '249.00', currencyCode: 'AUD' },
  compareAtPrice: { amount: '329.00', currencyCode: 'AUD' },
};
const product = {
  id: 'product-1',
  handle: 'dryer',
  title: 'Dryer',
  description: 'A hand dryer',
  createdAt: '2026-01-01T00:00:00Z',
  featuredImage: { url: 'https://cdn.shopify.com/test.jpg', altText: 'Steel dryer' },
  variants: { nodes: [variant], pageInfo: { hasNextPage: false } },
};
function connection<T>(nodes: T[], more = false, cursor: string | null = null) {
  return { nodes, pageInfo: { hasNextPage: more, endCursor: cursor } };
}
function response(data: unknown, status = 200) {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('Shopify uses Australian context, public token, pagination and configured collection handles', async () => {
  const calls: { query: string; variables: Record<string, string | null> }[] = [];
  const service = createShopifyService(config, async (url, options) => {
    assert.equal(url, 'https://example.myshopify.com/api/2026-07/graphql.json');
    assert.equal(
      (options?.headers as Record<string, string>)['X-Shopify-Storefront-Access-Token'],
      config.token,
    );
    const body = JSON.parse(options?.body as string);
    assert.match(body.query, /@inContext\(country: AU\)/);
    calls.push(body);
    if (body.query.includes('query Products')) {
      assert.match(body.query, /images\(first: 3\)/);
      assert.match(body.query, /maxWidth: 800, maxHeight: 800, preferredContentType: JPG/);
      return response({
        products: body.variables.after
          ? connection([{ ...product, id: 'product-2' }])
          : connection([product], true, 'page-2'),
      });
    }
    if (body.variables.handle === 'our-deals')
      return response({
        collection: {
          products: body.variables.after
            ? connection([{ id: 'product-2' }])
            : connection([{ id: 'product-1' }], true, 'deals-2'),
        },
      });
    if (body.variables.handle === 'electric-dryers')
      return response({ collection: { products: connection([{ id: 'product-1' }]) } });
    return response({ collection: null });
  });
  const result = await service.load();
  assert.equal(result.source, 'shopify');
  assert.equal(result.products.length, 2);
  assert.deepEqual(result.dealIds, ['product-1', 'product-2']);
  assert.equal(result.products[0]?.category, 'hand-dryers');
  assert.equal(result.products[1]?.category, null);
  assert.equal(result.products[0]?.price, 249);
  assert.ok(calls.some((c) => c.variables.after === 'page-2'));
  assert.ok(calls.some((c) => c.variables.after === 'deals-2'));
});
test('discounted available variant supplies both displayed price and cart variant ID', () => {
  const other = { ...variant, id: 'regular', compareAtPrice: null };
  const normalized = normalizeProduct(
    { ...product, variants: { nodes: [other, variant], pageInfo: { hasNextPage: false } } },
    null,
  );
  assert.equal(normalized.variantId, 'variant-1');
  assert.equal(normalized.compareAtPrice, 329);
});
test('non-AUD prices, malformed amounts and unsupported variant pagination fail explicitly', () => {
  assert.throws(
    () =>
      normalizeProduct(
        {
          ...product,
          variants: {
            nodes: [{ ...variant, price: { amount: '20', currencyCode: 'USD' } }],
            pageInfo: { hasNextPage: false },
          },
        },
        null,
      ),
    /AUD/,
  );
  assert.throws(
    () =>
      normalizeProduct(
        {
          ...product,
          variants: {
            nodes: [{ ...variant, price: { amount: 'NaN', currencyCode: 'AUD' } }],
            pageInfo: { hasNextPage: false },
          },
        },
        null,
      ),
    /invalid price/,
  );
  assert.throws(
    () =>
      normalizeProduct(
        { ...product, variants: { ...product.variants, pageInfo: { hasNextPage: true } } },
        null,
      ),
    /100 variants/,
  );
});
test('HTTP and GraphQL failures never fall back silently to sample products', async () => {
  await assert.rejects(createShopifyService(config, async () => response(null, 401)).load(), /401/);
  await assert.rejects(
    createShopifyService(
      config,
      async () => new Response(JSON.stringify({ errors: [{ message: 'Access denied' }] })),
    ).load(),
    /permissions/,
  );
});
test('caller cancellation reaches the Storefront request', async () => {
  const abort = new AbortController();
  const service = createShopifyService(config, async (_, options) => {
    abort.abort();
    assert.equal(options?.signal?.aborted, true);
    throw new DOMException('Aborted', 'AbortError');
  });
  await assert.rejects(service.load(abort.signal), /Aborted/);
});
test('sample mode requires absent credentials; partial or invalid configuration is actionable', () => {
  const keys = [
    'EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN',
    'EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN',
    'EXPO_PUBLIC_SHOPIFY_API_VERSION',
    'EXPO_PUBLIC_SHOPIFY_CATEGORY_HANDLES',
  ];
  const originals = keys.map((key) => process.env[key]);
  try {
    keys.forEach((key) => delete process.env[key]);
    assert.equal(readShopifyConfig(), null);
    process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN = config.domain;
    assert.throws(readShopifyConfig, /incomplete/);
    process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN = config.token;
    assert.equal(readShopifyConfig()?.domain, config.domain);
    process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN = 'https://example.com';
    assert.throws(readShopifyConfig, /hostname/);
    process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN = config.domain;
    process.env.EXPO_PUBLIC_SHOPIFY_CATEGORY_HANDLES = '[]';
    assert.throws(readShopifyConfig, /JSON object/);
  } finally {
    keys.forEach((key, i) => {
      if (originals[i] === undefined) delete process.env[key];
      else process.env[key] = originals[i];
    });
  }
});

test('Shopify photos fall back to the selected variant and gallery without borrowing another variant image', () => {
  const photo = (name: string) => ({ url: `https://cdn.shopify.com/${name}.jpg`, altText: name });
  const gallery = photo('gallery');
  const selected = photo('selected');
  const node = {
    ...product,
    featuredImage: null,
    images: { nodes: [gallery, gallery] },
    variants: {
      nodes: [
        { ...variant, id: 'unavailable', availableForSale: false, image: photo('wrong-variant') },
        { ...variant, image: selected },
      ],
      pageInfo: { hasNextPage: false },
    },
  };
  const normalized = normalizeProduct(node, null);
  assert.equal(normalized.imageUrl, selected.url);
  assert.equal(normalized.imageAlt, 'selected');
  assert.deepEqual(normalized.imageUrls, [selected.url, gallery.url]);
  const galleryOnly = normalizeProduct({ ...node, variants: product.variants }, null);
  assert.equal(galleryOnly.imageUrl, gallery.url);
  const featured = normalizeProduct({ ...node, featuredImage: photo('featured') }, null);
  assert.deepEqual(featured.imageUrls, [photo('featured').url, selected.url, gallery.url]);
  const missing = normalizeProduct(
    { ...node, images: { nodes: [] }, variants: product.variants },
    null,
  );
  assert.equal(missing.imageUrl, undefined);
  assert.deepEqual(missing.imageUrls, []);
});
