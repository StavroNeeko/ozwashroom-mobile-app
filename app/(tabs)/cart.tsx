import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../src/state/Store';
import { money } from '../../src/catalog/types';
import { ProductImage } from '../../src/components/Products';
import {
  Action,
  CatalogBoundary,
  Copy,
  EmptyState,
  Icon,
  Page,
  ScreenTitle,
  SourceNotice,
} from '../../src/components/ui';
import { colors as c, fonts as f } from '../../src/theme';

export default function Cart() {
  const { cart, count, updateQuantity, catalog, cartReady } = useStore();
  const total =
    cart.reduce((sum, line) => sum + Math.round(line.product.price * 100) * line.quantity, 0) / 100;
  return (
    <Page>
      <ScreenTitle
        eyebrow="YOUR NEXT BETTER SPACE"
        title="Your cart"
        subtitle={`${count} ${count === 1 ? 'essential' : 'essentials'} selected`}
      />
      <SourceNotice />
      <CatalogBoundary>
        {!cartReady ? (
          <Copy>Restoring your cart…</Copy>
        ) : cart.length ? (
          <>
            <View style={{ gap: 12 }}>
              {cart.map((line) => (
                <View key={line.product.variantId} style={s.line}>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`View ${line.product.title}`}
                    onPress={() =>
                      router.push({ pathname: '/product/[id]', params: { id: line.product.id } })
                    }
                    style={s.art}
                  >
                    <ProductImage product={line.product} size={80} />
                  </Pressable>
                  <View style={{ flex: 1, gap: 9 }}>
                    <Copy style={{ fontFamily: f.medium }}>{line.product.title}</Copy>
                    <Copy style={{ fontFamily: f.bold }}>{money(line.product.price)} AUD</Copy>
                    <View style={s.stepper}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Decrease quantity of ${line.product.title}`}
                        onPress={() => updateQuantity(line.product.variantId, -1)}
                        style={s.step}
                      >
                        <Icon
                          name={line.quantity === 1 ? 'trash-outline' : 'remove-outline'}
                          size={16}
                        />
                      </Pressable>
                      <Copy
                        accessibilityLabel={`Quantity ${line.quantity}`}
                        style={{ minWidth: 24, textAlign: 'center' }}
                      >
                        {line.quantity}
                      </Copy>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Increase quantity of ${line.product.title}`}
                        disabled={line.quantity >= 99}
                        onPress={() => updateQuantity(line.product.variantId, 1)}
                        style={[s.step, line.quantity >= 99 && { opacity: 0.4 }]}
                      >
                        <Icon name="add-outline" size={16} />
                      </Pressable>
                    </View>
                  </View>
                  <Copy style={s.lineTotal}>{money(line.product.price * line.quantity)}</Copy>
                </View>
              ))}
            </View>
            <View style={s.summary}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Copy style={{ fontFamily: f.bold, fontSize: 19 }}>
                  {catalog?.source === 'sample' ? 'Sample subtotal' : 'Subtotal'}
                </Copy>
                <Copy style={{ fontFamily: f.bold, fontSize: 22 }}>{money(total)} AUD</Copy>
              </View>
              <Copy style={s.note}>
                Shipping and tax totals are not calculated.{' '}
                {catalog?.source === 'sample'
                  ? 'This sample cart cannot place orders or take payments.'
                  : 'Checkout is not enabled in this version. No order will be placed.'}
              </Copy>
              <Action
                secondary
                label="Continue browsing"
                icon="arrow-forward"
                onPress={() => router.navigate('/categories')}
              />
            </View>
          </>
        ) : (
          <EmptyState
            icon="bag-handle-outline"
            title="A fresh start for your space"
            message="Your cart is waiting for a few thoughtful essentials."
            action="Explore the collection"
            onAction={() => router.navigate('/categories')}
          />
        )}
      </CatalogBoundary>
    </Page>
  );
}
const s = StyleSheet.create({
  line: {
    backgroundColor: c.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  art: { backgroundColor: c.soft, borderRadius: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  step: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.soft,
    borderRadius: 5,
  },
  lineTotal: { fontFamily: f.bold, fontSize: 13 },
  summary: { backgroundColor: c.white, padding: 22, borderRadius: 12, marginTop: 24, gap: 20 },
  note: { color: c.muted, fontSize: 12, lineHeight: 20 },
});
