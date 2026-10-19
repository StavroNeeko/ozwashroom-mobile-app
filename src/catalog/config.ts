export type ShopifyConfig = {
  domain: string;
  token: string;
  apiVersion: string;
  dealsHandle: string;
  categoryHandles: Record<string, string>;
};
// Expo replaces direct EXPO_PUBLIC_* references at bundle time. These values are public.
export function readShopifyConfig(): ShopifyConfig | null {
  const domain = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain && !token) return null;
  if (!domain || !token)
    throw new Error(
      'Shopify configuration is incomplete. Set both the store domain and public Storefront token, or remove both to use sample data.',
    );
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain))
    throw new Error(
      'Use your Shopify store hostname, for example your-store.myshopify.com (without https://).',
    );
  const apiVersion = process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION || '2026-07';
  if (!/^\d{4}-(01|04|07|10)$/.test(apiVersion))
    throw new Error('Shopify API version must use YYYY-MM format.');
  let categoryHandles: Record<string, string> = {};
  const raw = process.env.EXPO_PUBLIC_SHOPIFY_CATEGORY_HANDLES;
  if (raw) {
    try {
      const value: unknown = JSON.parse(raw);
      if (
        !value ||
        Array.isArray(value) ||
        typeof value !== 'object' ||
        !Object.values(value).every((v) => typeof v === 'string' && v.length > 0)
      )
        throw new Error();
      categoryHandles = value as Record<string, string>;
    } catch {
      throw new Error(
        'Category handles must be a JSON object mapping category IDs to collection handles.',
      );
    }
  }
  return {
    domain,
    token,
    apiVersion,
    dealsHandle: process.env.EXPO_PUBLIC_SHOPIFY_DEALS_COLLECTION || 'special-deals',
    categoryHandles,
  };
}
