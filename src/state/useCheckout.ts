import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { readShopifyConfig } from '../catalog/config';
import { createShopifyCheckout } from '../checkout/shopify';
import { useStore } from './Store';

export function useCheckout() {
  const { cart, catalog, cartReady } = useStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const clearError = useCallback(() => setError(null), []);
  // Cancel a pending handoff if the buyer leaves the cart or its contents change.
  useFocusEffect(useCallback(() => () => controller.current?.abort(), []));
  useEffect(() => {
    controller.current?.abort();
    setError(null);
  }, [cart]);

  const checkout = useCallback(async () => {
    if (controller.current || !cartReady || catalog?.source !== 'shopify' || !cart.length) return;
    const abort = new AbortController();
    controller.current = abort;
    setPending(true);
    setError(null);
    try {
      if (cart.some((line) => !line.product.available))
        throw new Error('Some products are unavailable. Refresh products and review your cart.');
      const config = readShopifyConfig();
      if (!config) throw new Error('Connect Shopify before using checkout.');
      const url = await createShopifyCheckout(
        config,
        cart.map((line) => ({ merchandiseId: line.product.variantId, quantity: line.quantity })),
        abort.signal,
      );
      if (abort.signal.aborted) return;
      if (Platform.OS === 'web') {
        // Same-tab navigation avoids async popup blockers and preserves browser Back.
        window.location.assign(url);
      } else {
        try {
          await Linking.openURL(url);
        } catch {
          throw new Error(
            'Couldn’t open checkout in your browser. Your cart is saved; please try again.',
          );
        }
      }
    } catch (e) {
      if (!abort.signal.aborted) {
        setError(
          e instanceof Error && e.name === 'AbortError'
            ? 'Shopify took too long to respond. Your cart is saved; please try again.'
            : e instanceof TypeError
              ? 'Couldn’t reach Shopify. Check your connection and try again.'
              : e instanceof Error
                ? e.message
                : 'Couldn’t open checkout. Please try again.',
        );
      }
    } finally {
      if (controller.current === abort) controller.current = null;
      setPending(false);
    }
  }, [cart, cartReady, catalog?.source]);
  return { checkout, pending, error, clearError };
}
