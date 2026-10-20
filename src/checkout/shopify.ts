import { ShopifyConfig } from '../catalog/config';
import { createStorefrontRequest } from '../catalog/storefront';

export type CheckoutLine = { merchandiseId: string; quantity: number };
type CartResult = {
  cartCreate: {
    userErrors: { message: string }[];
    warnings: { message: string }[];
    cart: {
      checkoutUrl: string;
      cost: { subtotalAmount: { currencyCode: string } };
      lines: {
        nodes: { quantity: number; merchandise: { id: string } }[];
        pageInfo: { hasNextPage: boolean };
      };
    } | null;
  };
};

const mutation = `mutation CreateCheckout($input: CartInput!) {
  cartCreate(input: $input) {
    userErrors { message }
    warnings { message }
    cart {
      checkoutUrl
      cost { subtotalAmount { currencyCode } }
      lines(first: 250) {
        nodes { quantity merchandise { ... on ProductVariant { id } } }
        pageInfo { hasNextPage }
      }
    }
  }
}`;

export async function createShopifyCheckout(
  config: ShopifyConfig,
  lines: CheckoutLine[],
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  if (
    !lines.length ||
    lines.length > 250 ||
    new Set(lines.map((line) => line.merchandiseId)).size !== lines.length ||
    lines.some(
      (line) =>
        !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(line.merchandiseId) ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 99,
    )
  )
    throw new Error('Review your cart before checkout. Only live Shopify products can be ordered.');

  const request = createStorefrontRequest(config, fetcher, 'checkout');
  const result = await request<CartResult>(
    mutation,
    { input: { lines, buyerIdentity: { countryCode: 'AU' } } },
    signal,
  );
  const payload = result.cartCreate;
  if (payload?.userErrors?.length)
    throw new Error(
      `Shopify could not prepare checkout: ${payload.userErrors.map((e) => e.message).join(' ')}`,
    );
  if (payload?.warnings?.length)
    throw new Error(
      'Shopify reported a change to your items. Refresh products and review your cart before trying again.',
    );
  const cart = payload?.cart;
  if (!cart?.checkoutUrl || !Array.isArray(cart.lines?.nodes) || cart.lines.pageInfo?.hasNextPage)
    throw new Error('Shopify did not return a complete checkout. Please try again.');
  // Do not silently send a reduced or substituted cart to payment.
  const received = new Map<string, number>();
  for (const line of cart.lines.nodes) {
    const id = line.merchandise?.id;
    if (!id || !Number.isInteger(line.quantity) || line.quantity < 1)
      throw new Error('Shopify returned an invalid cart. Refresh products and try again.');
    received.set(id, (received.get(id) ?? 0) + line.quantity);
  }
  if (
    received.size !== lines.length ||
    lines.some((line) => received.get(line.merchandiseId) !== line.quantity)
  )
    throw new Error(
      'Item availability or quantities changed. Refresh products and review your cart before checkout.',
    );
  if (cart.cost?.subtotalAmount?.currencyCode !== 'AUD')
    throw new Error('Checkout must use AUD. Please check the store’s Australian market settings.');

  let url: URL;
  try {
    url = new URL(cart.checkoutUrl);
  } catch {
    throw new Error('Shopify returned an invalid checkout link. Please try again.');
  }
  const hosts = new Set([
    config.domain.toLowerCase(),
    'ozwashroom.com.au',
    'www.ozwashroom.com.au',
    'checkout.shopify.com',
  ]);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    !hosts.has(url.hostname)
  )
    throw new Error('Shopify returned an unexpected checkout link. Please contact Ozwashroom.');
  return url.href;
}
