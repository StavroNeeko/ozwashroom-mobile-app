import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useStore } from '../../src/state/Store';
import { categories, money, savingsPercent } from '../../src/catalog/types';
import {
  Action,
  CatalogBoundary,
  Copy,
  EmptyState,
  Icon,
  Page,
  SourceNotice,
} from '../../src/components/ui';
import { ProductImage } from '../../src/components/Products';
import { colors as c, fonts as f } from '../../src/theme';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalog, add, cartReady } = useStore();
  const [added, setAdded] = useState(false);
  const { width } = useWindowDimensions();
  const product = catalog?.products.find((p) => p.id === id);
  const savings = product ? savingsPercent(product) : 0;
  return (
    <Page>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
        style={s.back}
      >
        <Icon name="arrow-back" size={18} />
        <Copy>Back to browsing</Copy>
      </Pressable>
      <SourceNotice />
      <CatalogBoundary>
        {product ? (
          <View style={[s.layout, width > 750 && { flexDirection: 'row' }]}>
            <View style={s.image}>
              <ProductImage product={product} size={280} />
            </View>
            <View style={s.content}>
              <Copy style={s.eyebrow}>
                {categories.find((c) => c.id === product.category)?.title || 'WASHROOM ESSENTIALS'}
              </Copy>
              <Copy accessibilityRole="header" style={s.title}>
                {product.title}
              </Copy>
              <View style={s.prices}>
                <Copy style={s.price}>{money(product.price)}</Copy>
                {savings > 0 && <Copy style={s.was}>{money(product.compareAtPrice!)}</Copy>}
                <Copy style={{ color: c.muted, fontSize: 12 }}>AUD</Copy>
              </View>
              {savings > 0 && (
                <Copy style={s.saving}>
                  Save {savings}% · {money(product.compareAtPrice! - product.price)} less
                </Copy>
              )}
              <Copy style={s.description}>
                {product.description ||
                  'Explore this washroom essential from the Ozwashroom catalogue.'}
              </Copy>
              <View style={s.availability}>
                <View style={[s.dot, { backgroundColor: product.available ? c.primary : c.red }]} />
                <Copy style={{ fontSize: 12 }}>
                  {product.available
                    ? catalog?.source === 'sample'
                      ? 'Sample availability'
                      : 'Available in the storefront'
                    : 'Currently unavailable'}
                </Copy>
              </View>
              <Action
                disabled={!product.available || !cartReady}
                label={
                  !product.available
                    ? 'Unavailable'
                    : !cartReady
                      ? 'Preparing cart…'
                      : added
                        ? 'Add another to cart'
                        : 'Add to cart'
                }
                icon="bag-add-outline"
                onPress={() => {
                  add(product);
                  setAdded(true);
                }}
              />
              {added && (
                <View accessibilityLiveRegion="polite" style={{ gap: 14 }}>
                  <Copy style={{ color: c.primary }}>Added to your cart.</Copy>
                  <Action secondary label="View cart" onPress={() => router.navigate('/cart')} />
                </View>
              )}
              <Copy style={s.note}>
                {catalog?.source === 'sample'
                  ? 'This is a sample product. Prices and savings are illustrative; no purchase will be made.'
                  : 'Your cart is saved on this device. Ordering and checkout are not enabled in this version.'}
              </Copy>
            </View>
          </View>
        ) : (
          <EmptyState
            title="Product not found"
            message="This product may no longer be available in the catalogue."
            action="Explore categories"
            onAction={() => router.navigate('/categories')}
          />
        )}
      </CatalogBoundary>
    </Page>
  );
}
const s = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: 14 },
  layout: { gap: 30 },
  image: {
    flex: 1,
    minHeight: 330,
    backgroundColor: '#EEF5FB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 18 },
  eyebrow: { fontSize: 10, textTransform: 'uppercase', color: c.muted, letterSpacing: 1.5 },
  title: { fontFamily: f.bold, fontSize: 32, letterSpacing: -0.8 },
  prices: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  price: { fontFamily: f.bold, fontSize: 30 },
  was: { color: c.muted, textDecorationLine: 'line-through', fontSize: 18 },
  saving: { color: c.primary, fontFamily: f.bold, fontSize: 13 },
  description: { color: c.muted, lineHeight: 24 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 4 },
  note: {
    color: c.muted,
    fontSize: 12,
    lineHeight: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
});
