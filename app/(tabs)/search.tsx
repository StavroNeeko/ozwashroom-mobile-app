import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
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
import { categories } from '../../src/catalog/types';
import { colors as c, fonts as f } from '../../src/theme';

export default function Search() {
  const [query, setQuery] = useState('');
  const { catalog } = useStore();
  const trimmed = query.trim().toLocaleLowerCase();
  const products =
    catalog?.products.filter((product) =>
      `${product.title} ${categories.find((cat) => cat.id === product.category)?.title || ''}`
        .toLocaleLowerCase()
        .includes(trimmed),
    ) || [];
  return (
    <Page>
      <ScreenTitle eyebrow="FIND YOUR PERFECT FIT" title="Search essentials" />
      <View style={s.inputWrap}>
        <Icon name="search-outline" />
        <TextInput
          accessibilityLabel="Search products"
          placeholder="Try hand dryers or soap dispensers"
          placeholderTextColor={c.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          style={s.input}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
            style={{ padding: 10 }}
          >
            <Icon name="close-circle" size={20} />
          </Pressable>
        )}
      </View>
      <SourceNotice />
      <CatalogBoundary>
        {trimmed ? (
          <Copy style={s.result}>
            {products.length} {products.length === 1 ? 'result' : 'results'} for “{query.trim()}”
          </Copy>
        ) : (
          <Copy style={s.result}>Explore the catalogue</Copy>
        )}
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon="search-outline"
            title="No matches just yet"
            message="Try a different product name or browse a category."
            action="Clear search"
            onAction={() => setQuery('')}
          />
        )}
      </CatalogBoundary>
    </Page>
  );
}
const s = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 9,
    backgroundColor: c.white,
    paddingLeft: 14,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 12,
    fontFamily: f.regular,
    color: c.ink,
    fontSize: 14,
  },
  result: { fontSize: 13, marginBottom: 20, color: c.muted },
});
