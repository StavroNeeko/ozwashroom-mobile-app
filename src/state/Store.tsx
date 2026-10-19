import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { readShopifyConfig } from '../catalog/config';
import { sampleService } from '../catalog/sample';
import { createShopifyService } from '../catalog/shopify';
import { Catalog, Product } from '../catalog/types';
import { CartLine, changeQuantity } from './cart';
type Store = {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  cart: CartLine[];
  count: number;
  add: (product: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  cartReady: boolean;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: React.PropsWithChildren) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const cartWrite = useRef(Promise.resolve());
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const config = readShopifyConfig();
        const result = await (config ? createShopifyService(config) : sampleService).load(
          abort.signal,
        );
        if (!abort.signal.aborted) setCatalog(result);
      } catch (e) {
        if (!abort.signal.aborted)
          setError(e instanceof Error ? e.message : 'Unable to load products. Please try again.');
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [revision]);
  // Store only IDs/quantities; reconcile against current source and prices on every launch.
  useEffect(() => {
    if (!catalog || cartReady) return;
    let active = true;
    AsyncStorage.getItem(`ozwashroom-cart-${catalog.source}`)
      .then((raw) => {
        if (!raw || !active) return;
        const saved: unknown = JSON.parse(raw);
        if (!Array.isArray(saved)) return;
        const seen = new Set<string>();
        const lines: CartLine[] = [];
        for (const item of saved) {
          if (
            !item ||
            typeof item !== 'object' ||
            typeof item.variantId !== 'string' ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > 99 ||
            seen.has(item.variantId)
          )
            continue;
          const product = catalog.products.find(
            (p) => p.variantId === item.variantId && p.available,
          );
          if (product) {
            lines.push({ product, quantity: item.quantity });
            seen.add(item.variantId);
          }
        }
        setCart(lines);
      })
      .catch(() => {
        /* Storage is optional; browsing and the in-memory cart still work. */
      })
      .finally(() => {
        if (active) setCartReady(true);
      });
    return () => {
      active = false;
    };
  }, [catalog, cartReady]);
  useEffect(() => {
    if (!cartReady || !catalog) return;
    const key = `ozwashroom-cart-${catalog.source}`;
    const value = JSON.stringify(
      cart.map(({ product, quantity }) => ({ variantId: product.variantId, quantity })),
    );
    cartWrite.current = cartWrite.current
      .then(() => AsyncStorage.setItem(key, value))
      .catch(() => {});
  }, [cart, cartReady, catalog]);
  // Refreshes may change availability or prices; update existing cart snapshots.
  useEffect(() => {
    if (!catalog || !cartReady) return;
    setCart((lines) =>
      lines.flatMap((line) => {
        const product = catalog.products.find(
          (p) => p.variantId === line.product.variantId && p.available,
        );
        return product ? [{ ...line, product }] : [];
      }),
    );
  }, [catalog, cartReady]);
  const add = useCallback(
    (product: Product) => {
      if (!product.available || !cartReady) return;
      setCart((lines) =>
        lines.some((l) => l.product.variantId === product.variantId)
          ? changeQuantity(lines, product.variantId, 1)
          : [...lines, { product, quantity: 1 }],
      );
    },
    [cartReady],
  );
  const value = useMemo<Store>(
    () => ({
      catalog,
      loading,
      error,
      refresh: () => setRevision((r) => r + 1),
      cart,
      count: cart.reduce((sum, line) => sum + line.quantity, 0),
      add,
      cartReady,
      updateQuantity: (id, delta) => setCart((lines) => changeQuantity(lines, id, delta)),
    }),
    [catalog, loading, error, cart, add, cartReady],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}
