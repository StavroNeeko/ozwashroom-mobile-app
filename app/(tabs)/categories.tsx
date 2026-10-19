import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { categories } from '../../src/catalog/types';
import { CategoryIcon } from '../../src/components/CategoryIcon';
import { Copy, Icon, Page, ScreenTitle, SourceNotice } from '../../src/components/ui';
import { colors as c, fonts as f } from '../../src/theme';

export default function Categories() {
  const { width } = useWindowDimensions();
  const columns = width > 900 ? 3 : 2;
  const cardWidth = (Math.min(width, 1200) - 44 - (columns - 1) * 14) / columns;
  return (
    <Page>
      <ScreenTitle
        eyebrow="A PLACE FOR EVERYTHING"
        title="Shop by Category"
        subtitle="Find the right finishing touches for your space."
      />
      <SourceNotice />
      <View style={s.grid}>
        {categories.map((category) => (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Shop ${category.title}`}
            key={category.id}
            onPress={() =>
              router.push({ pathname: '/collection/[id]', params: { id: category.id } })
            }
            style={({ pressed }) => [s.card, { width: cardWidth, opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={s.art}>
              <CategoryIcon category={category.id} size={52} />
            </View>
            <View style={s.label}>
              <Copy style={s.title}>{category.title}</Copy>
              <Icon name="arrow-forward" size={17} />
            </View>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: c.white,
  },
  art: { alignItems: 'center', justifyContent: 'center', height: 130, backgroundColor: c.soft },
  label: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 15, minHeight: 72 },
  title: { flex: 1, fontFamily: f.bold, fontSize: 14 },
});
