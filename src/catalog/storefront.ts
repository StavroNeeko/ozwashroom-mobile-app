import { ShopifyConfig } from './config';

export function createStorefrontRequest(
  config: ShopifyConfig,
  fetcher: typeof fetch = fetch,
  purpose = 'the catalogue',
) {
  return async <T>(
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
          `Shopify could not load ${purpose}. Check your public Storefront token and permissions.`,
        );
      return body.data;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  };
}
