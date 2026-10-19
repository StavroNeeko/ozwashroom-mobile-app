import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import {
  categories,
  CollectionId,
  collectionTitles,
  selectCollection,
} from '../../src/catalog/types';
import { useStore } from '../../src/state/Store';
import {
  CatalogBoundary,
  Copy,
  EmptyState,
  Icon,
  Page,
  ScreenTitle,
  SourceNotice,
} from '../../src/components/ui';
import { ProductGrid } from '../../src/components/Products';
import { colors } from '../../src/theme';

export default function Collection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalog } = useStore();
  const category = categories.find((c) => c.id === id);
  const collection = Object.hasOwn(collectionTitles, id) ? (id as CollectionId) : null;
  const title =
    category?.title || (collection ? collectionTitles[collection] : 'Collection not found');
  const products = catalog
    ? category
      ? catalog.products.filter((p) => p.category === category.id)
      : collection
        ? selectCollection(catalog, collection)
        : []
    : [];
  return (
    <Page>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Back to home"
        onPress={() => router.navigate('/')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          minHeight: 44,
          marginBottom: 12,
        }}
      >
        <Icon name="arrow-back" size={17} />
        <Copy>Back to home</Copy>
      </Pressable>
      <ScreenTitle eyebrow="CURATED FOR YOUR SPACE" title={title} />
      <SourceNotice />
      <CatalogBoundary>
        {products.length ? (
          <>
            <Copy style={{ color: colors.muted, marginBottom: 18 }}>
              {products.length} {products.length === 1 ? 'essential' : 'essentials'}
            </Copy>
            <ProductGrid products={products} isNew={id === 'new'} />
          </>
        ) : (
          <EmptyState
            title={category || collection ? 'More essentials on the way' : 'Collection not found'}
            message="Explore our other collections to find something for your space."
            action="Browse categories"
            onAction={() => router.navigate('/categories')}
          />
        )}
      </CatalogBoundary>
      <View style={{ height: 20 }} />
    </Page>
  );
}
