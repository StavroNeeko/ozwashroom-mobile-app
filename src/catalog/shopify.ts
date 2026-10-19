import { ShopifyConfig } from './config';
import { Catalog, CatalogService, categories, CategoryId, Product } from './types';

type Money = { amount: string; currencyCode: string };
type Node = {
  id: string;
  handle: string;
  title: string;
  description: string;
  createdAt: string;
  featuredImage: { url: string; altText: string | null } | null;
  variants: {
    nodes: { id: string; availableForSale: boolean; price: Money; compareAtPrice: Money | null }[];
    pageInfo: { hasNextPage: boolean };
  };
};
type Connection<T> = { nodes: T[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
type Request = <T>(
  query: string,
  variables: Record<string, unknown>,
  signal?: AbortSignal,
) => Promise<T>;
const fields = `id handle title description createdAt featuredImage { url altText }
  variants(first: 100) { nodes { id availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } } pageInfo { hasNextPage } }`;
const productsQuery = `query Products($after: String) { products(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) { nodes { ${fields} } pageInfo { hasNextPage endCursor } } }`;
const collectionQuery = `query Collection($handle: String!, $after: String) { collection(handle: $handle) { products(first: 100, after: $after) { nodes { id } pageInfo { hasNextPage endCursor } } } }`;

export function normalizeProduct(node: Node, category: CategoryId | null): Product {
  if (node.variants.pageInfo.hasNextPage)
    throw new Error(
      'A product has more than 100 variants; extend variant pagination before using this catalogue.',
    );
  // Select a real purchasable variant so price, savings and cart ID always agree.
  const variant =
    node.variants.nodes.find(
      (v) =>
        v.availableForSale &&
        v.compareAtPrice &&
        Number(v.compareAtPrice.amount) > Number(v.price.amount),
    ) ??
    node.variants.nodes.find((v) => v.availableForSale) ??
    node.variants.nodes[0];
  if (!variant) throw new Error('Shopify returned a product without a variant.');
  if (variant.price.currencyCode !== 'AUD')
    throw new Error(
      'The storefront must return AUD prices. Configure the Australian market in Shopify.',
    );
  const price = Number(variant.price.amount);
  const compare = variant.compareAtPrice ? Number(variant.compareAtPrice.amount) : undefined;
  if (
    !Number.isFinite(price) ||
    price < 0 ||
    (compare !== undefined && (!Number.isFinite(compare) || compare < 0))
  )
    throw new Error('Shopify returned an invalid price.');
  if (variant.compareAtPrice && variant.compareAtPrice.currencyCode !== 'AUD')
    throw new Error('Compare-at prices must also use AUD.');
  return {
    id: node.id,
    variantId: variant.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    category,
    price,
    compareAtPrice: compare,
    currency: 'AUD',
    available: variant.availableForSale,
    imageUrl: node.featuredImage?.url,
    imageAlt: node.featuredImage?.altText ?? node.title,
    createdAt: node.createdAt,
  };
}

export function createShopifyService(
  config: ShopifyConfig,
  fetcher: typeof fetch = fetch,
): CatalogService {
  const request: Request = async <T>(
    query: string,
    variables: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<T> => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(abort, 20000);
    try {
      const response = await fetcher(
        `https://${config.domain}/api/${config.apiVersion}/graphql.json`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': config.token,
          },
          body: JSON.stringify({
            query: query.replace('{', '@inContext(country: AU) {'),
            variables,
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          `Shopify request failed (${response.status}). Check your public Storefront token and store domain.`,
        );
      const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
      if (body.errors?.length || !body.data)
        throw new Error(
          'Shopify could not load the catalogue. Check Storefront permissions and collection configuration.',
        );
      return body.data;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  };
  async function collect<T>(
    getPage: (after: string | null) => Promise<Connection<T>>,
  ): Promise<{ nodes: T[]; truncated: boolean }> {
    const nodes: T[] = [];
    let after: string | null = null;
    for (let page = 0; page < 10; page++) {
      const result = await getPage(after);
      nodes.push(...result.nodes);
      if (!result.pageInfo.hasNextPage) return { nodes, truncated: false };
      if (!result.pageInfo.endCursor || result.pageInfo.endCursor === after)
        throw new Error('Shopify returned an invalid pagination cursor.');
      after = result.pageInfo.endCursor;
    }
    return { nodes, truncated: true };
  }
  return {
    async load(signal): Promise<Catalog> {
      const productResult = await collect(
        async (after) =>
          (await request<{ products: Connection<Node> }>(productsQuery, { after }, signal))
            .products,
      );
      const handles = [
        config.dealsHandle,
        ...categories.map((c) => config.categoryHandles[c.id] || c.collectionHandle),
      ];
      // Sequential requests avoid exhausting the Storefront query complexity budget.
      const membership: { nodes: { id: string }[]; truncated: boolean }[] = [];
      for (const handle of handles) {
        membership.push(
          await collect(async (after) => {
            const data = await request<{
              collection: { products: Connection<{ id: string }> } | null;
            }>(collectionQuery, { handle, after }, signal);
            return (
              data.collection?.products ?? {
                nodes: [],
                pageInfo: { hasNextPage: false, endCursor: null },
              }
            );
          }),
        );
      }
      return {
        source: 'shopify',
        dealIds: membership[0]!.nodes.map((n) => n.id),
        truncated: productResult.truncated || membership.some((m) => m.truncated),
        products: productResult.nodes.map((node) =>
          normalizeProduct(
            node,
            categories.find((_, i) => membership[i + 1]!.nodes.some((n) => n.id === node.id))?.id ??
              null,
          ),
        ),
      };
    },
  };
}
