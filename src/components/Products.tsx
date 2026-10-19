import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import {
  categories,
  CollectionId,
  collectionTitles,
  Product,
  money,
  savingsPercent,
} from '../catalog/types';
import { colors as c, fonts as f } from '../theme';
import { Copy, Icon } from './ui';
import { bundledProductPhotos } from './productPhotos';

export function ProductImage({ product, size = 150 }: { product: Product; size?: number }) {
  const [failed, setFailed] = useState(false);
  return product.imageUrl && !failed ? (
    <Image
      source={bundledProductPhotos[product.imageUrl] || { uri: product.imageUrl }}
      accessibilityLabel={product.imageAlt || product.title}
      style={{ width: size, height: size }}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  ) : (
    <View
      accessibilityLabel={`Photo unavailable for ${product.title}`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', gap: 9 }}
    >
      <Icon name="image-outline" size={Math.min(36, size / 3)} color={c.muted} />
      {size >= 100 && <Copy style={{ color: c.muted, fontSize: 11 }}>Photo coming soon</Copy>}
    </View>
  );
}
export function ProductCard({
  product,
  width,
  isNew,
}: {
  product: Product;
  width: number | `${number}%`;
  isNew?: boolean;
}) {
  const savings = savingsPercent(product);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`View ${product.title}, ${money(product.price)} AUD`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [s.card, { width, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={s.art}>
        {savings > 0 ? (
          <View style={s.saleBadge}>
            <Copy style={s.saleText}>SAVE {savings}%</Copy>
          </View>
        ) : isNew ? (
          <View style={s.newBadge}>
            <Copy style={s.newText}>NEW</Copy>
          </View>
        ) : null}
        <ProductImage
          product={product}
          size={typeof width === 'number' ? Math.min(155, width - 24) : 155}
        />
        <View style={s.corner}>
          <Icon name="arrow-forward" size={16} />
        </View>
      </View>
      <View style={s.cardBody}>
        <Copy style={s.category}>
          {categories.find((cat) => cat.id === product.category)?.title || 'Washroom essentials'}
        </Copy>
        <Copy numberOfLines={2} style={s.productTitle}>
          {product.title}
        </Copy>
        <View style={s.prices}>
          <Copy style={s.price}>{money(product.price)}</Copy>
          {savings > 0 && <Copy style={s.original}>{money(product.compareAtPrice!)}</Copy>}
        </View>
        <Copy style={s.priceNote}>{product.available ? 'AUD' : 'Currently unavailable'}</Copy>
      </View>
    </Pressable>
  );
}
export function ProductGrid({ products, isNew }: { products: Product[]; isNew?: boolean }) {
  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 4 : width >= 650 ? 3 : 2;
  const available = Math.min(width, 1200) - 44;
  return (
    <View style={s.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          width={(available - (columns - 1) * 14) / columns}
          isNew={isNew}
        />
      ))}
    </View>
  );
}
export function ProductSection({
  collection,
  products,
  subtitle,
}: {
  collection: CollectionId;
  products: Product[];
  subtitle: string;
}) {
  const { width } = useWindowDimensions();
  const cardWidth =
    width >= 1000 ? (Math.min(width, 1200) - 44 - 42) / 4 : width >= 650 ? 220 : 177;
  return (
    <View style={s.section}>
      <View style={s.sectionHeading}>
        <View style={{ flex: 1, gap: 5 }}>
          <View style={s.sectionTitleRow}>
            {collection === 'deals' && <Icon name="flash-outline" size={22} />}
            <Copy accessibilityRole="header" style={s.sectionTitle}>
              {collectionTitles[collection]}
            </Copy>
          </View>
          <Copy style={s.sectionSubtitle}>{subtitle}</Copy>
        </View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`View all ${collectionTitles[collection]}`}
          onPress={() => router.push({ pathname: '/collection/[id]', params: { id: collection } })}
          style={s.viewAll}
        >
          <Copy style={s.viewAllText}>View all</Copy>
          <Icon name="arrow-forward" size={15} />
        </Pressable>
      </View>
      {products.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingBottom: 3 }}
        >
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              width={cardWidth}
              isNew={collection === 'new'}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={s.sectionEmpty}>
          <Copy style={{ color: c.muted }}>
            No products in this collection yet. Come back soon.
          </Copy>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    backgroundColor: c.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DFE8F1',
  },
  art: { height: 176, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 14, gap: 7 },
  category: { fontSize: 9, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  productTitle: { fontSize: 14, fontFamily: f.medium, lineHeight: 21, minHeight: 42 },
  prices: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginTop: 3 },
  price: { fontSize: 18, fontFamily: f.bold, letterSpacing: -0.5 },
  original: { fontSize: 12, color: c.muted, textDecorationLine: 'line-through' },
  priceNote: { fontSize: 9, color: c.muted },
  saleBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: c.accent,
    borderRadius: 4,
  },
  saleText: { fontSize: 9, fontFamily: f.bold, color: c.primary, letterSpacing: 0.3 },
  newBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: c.white,
    borderRadius: 4,
  },
  newText: { fontSize: 9, fontFamily: f.bold },
  corner: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFF9',
    width: 28,
    height: 28,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: 34 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 23, letterSpacing: -0.7, fontFamily: f.bold },
  sectionSubtitle: { fontSize: 12, color: c.muted },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingLeft: 8 },
  viewAllText: { fontSize: 12, fontFamily: f.bold },
  sectionEmpty: { padding: 25, backgroundColor: c.white, borderRadius: 12 },
});
