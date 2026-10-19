import React from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { categories, selectCollection } from '../../src/catalog/types';
import { useStore } from '../../src/state/Store';
import { colors as c, fonts as f } from '../../src/theme';
import { Action, CatalogBoundary, Copy, Icon, SourceNotice, styles } from '../../src/components/ui';
import { BathroomArt, ProductArt } from '../../src/components/Artwork';
import { ProductSection } from '../../src/components/Products';

export default function Home() {
  const { catalog, refresh, loading } = useStore();
  const { width } = useWindowDimensions();
  const compact = width < 700;
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 38 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={c.green} />
      }
    >
      <View style={styles.container}>
        <View style={s.welcome}>
          <Copy style={styles.eyebrow}>THOUGHTFUL DETAILS. BETTER WASHROOMS.</Copy>
          <Copy style={s.welcomeSub}>Essentials for every space</Copy>
        </View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Search washroom products"
          onPress={() => router.navigate('/search')}
          style={s.search}
        >
          <Icon name="search-outline" size={20} />
          <Copy style={{ color: c.muted, flex: 1 }}>Find your washroom essentials</Copy>
          <View style={s.searchFilter}>
            <Icon name="options-outline" size={18} />
          </View>
        </Pressable>
        <View style={[s.hero, compact && { minHeight: 330 }]}>
          <View
            style={[s.heroCopy, { width: compact ? '62%' : '53%', padding: compact ? 22 : 35 }]}
          >
            <View style={s.pill}>
              <View style={s.pillDot} />
              <Copy style={s.pillText}>THE EVERYDAY, ELEVATED</Copy>
            </View>
            <Copy accessibilityRole="header" style={[s.heroTitle, { fontSize: compact ? 34 : 49 }]}>
              Better spaces.{'\n'}Start here.
            </Copy>
            <Copy style={[s.heroSubtitle, { maxWidth: compact ? 180 : 260 }]}>
              Considered essentials for a washroom that works beautifully.
            </Copy>
            <Action
              label="Shop essentials"
              icon="arrow-forward"
              onPress={() => router.navigate('/categories')}
            />
          </View>
          <View style={[s.heroArt, { width: compact ? '44%' : '47%' }]}>
            <BathroomArt />
          </View>
          <View style={s.heroNumber}>
            <Copy style={s.heroNumberText}>01 / EVERYDAY ESSENTIALS</Copy>
          </View>
        </View>
        <View style={s.values}>
          {[
            { icon: 'sparkles-outline' as const, label: 'Considered design' },
            { icon: 'business-outline' as const, label: 'For every space' },
            { icon: 'heart-outline' as const, label: 'Everyday essentials' },
          ].map((item) => (
            <View key={item.label} style={s.value}>
              <Icon name={item.icon} size={17} />
              <Copy style={s.valueText}>{item.label}</Copy>
            </View>
          ))}
        </View>
        <SourceNotice />
        <CatalogBoundary>
          {catalog && (
            <>
              <ProductSection
                collection="deals"
                products={selectCollection(catalog, 'deals')}
                subtitle="A little more value for your space."
              />
              <View style={s.categorySection}>
                <View style={s.categoryHeading}>
                  <View>
                    <Copy style={styles.eyebrow}>FIND YOUR ESSENTIALS</Copy>
                    <Copy accessibilityRole="header" style={s.sectionTitle}>
                      Shop by Category
                    </Copy>
                  </View>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="View all categories"
                    onPress={() => router.navigate('/categories')}
                    style={s.viewAll}
                  >
                    <Copy style={{ fontFamily: f.bold, fontSize: 12 }}>View all</Copy>
                    <Icon name="arrow-forward" size={15} />
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: compact ? 10 : 16 }}
                >
                  {categories.map((category) => (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Shop ${category.title}`}
                      key={category.id}
                      onPress={() =>
                        router.push({ pathname: '/collection/[id]', params: { id: category.id } })
                      }
                      style={{
                        width: compact ? 100 : (Math.min(width, 1200) - 44 - 80) / 6,
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <View style={s.categoryCircle}>
                        <ProductArt category={category.id} size={85} />
                      </View>
                      <Copy style={s.categoryLabel}>{category.shortTitle}</Copy>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <ProductSection
                collection="new"
                products={selectCollection(catalog, 'new')}
                subtitle="Fresh additions. Thoughtfully selected."
              />
              <View style={s.editorial}>
                <View style={s.editorialIcon}>
                  <Icon name="leaf-outline" size={30} color={c.lime} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Copy style={s.editorialTitle}>Small details. Lasting impressions.</Copy>
                  <Copy style={s.editorialBody}>
                    Create a space that feels considered, from the first touch to the finishing
                    detail.
                  </Copy>
                </View>
              </View>
              <ProductSection
                collection="discounted"
                products={selectCollection(catalog, 'discounted')}
                subtitle="Everyday essentials, a little less."
              />
            </>
          )}
        </CatalogBoundary>
        <View style={s.footer}>
          <Copy style={{ fontFamily: f.bold, fontSize: 19, letterSpacing: -0.6 }}>ozwashroom.</Copy>
          <Copy style={{ color: c.muted, fontSize: 11 }}>Better spaces. Every day.</Copy>
          <Copy style={s.footerNote}>
            {catalog?.source === 'sample'
              ? 'Demo catalogue. Products, offers and prices are illustrative.\nNo orders or payments are processed.'
              : 'Browse the catalogue. Checkout is not available in this version.'}
          </Copy>
        </View>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  welcome: { marginBottom: 20, gap: 5 },
  welcomeSub: { fontFamily: f.bold, fontSize: 26, letterSpacing: -0.8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.white,
    borderRadius: 9,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 23,
  },
  searchFilter: { borderLeftWidth: 1, borderLeftColor: c.line, paddingLeft: 13 },
  hero: {
    minHeight: 320,
    backgroundColor: '#E7EDDF',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCopy: { zIndex: 2, gap: 16, alignItems: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillDot: { width: 5, height: 5, backgroundColor: c.green, borderRadius: 4 },
  pillText: { fontSize: 8, letterSpacing: 1.2, fontFamily: f.bold },
  heroTitle: { fontFamily: f.bold, lineHeight: undefined, letterSpacing: -1.8 },
  heroSubtitle: { color: '#607564', fontSize: 13, lineHeight: 20 },
  heroArt: { position: 'absolute', right: 0, top: 0, bottom: 0 },
  heroNumber: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#F7F8EDC9',
    borderRadius: 4,
    padding: 6,
  },
  heroNumberText: { fontSize: 7, letterSpacing: 1.2 },
  values: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 21, gap: 8 },
  value: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  valueText: { fontSize: 10, color: '#607564', flexShrink: 1 },
  categorySection: {
    marginTop: 36,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.line,
  },
  categoryHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 23,
  },
  sectionTitle: { fontFamily: f.bold, fontSize: 23, letterSpacing: -0.7, marginTop: 7 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  categoryCircle: {
    backgroundColor: '#E9EEE3',
    borderRadius: 60,
    width: 94,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { fontFamily: f.medium, fontSize: 11, textAlign: 'center' },
  editorial: {
    marginTop: 36,
    borderRadius: 12,
    backgroundColor: c.ink,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  editorialIcon: {
    width: 56,
    height: 56,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#416353',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorialTitle: { color: '#F2F6E9', fontFamily: f.bold, fontSize: 19, letterSpacing: -0.4 },
  editorialBody: { color: '#B7CBBB', fontSize: 12, lineHeight: 19, maxWidth: 550 },
  footer: {
    alignItems: 'center',
    marginTop: 44,
    paddingTop: 27,
    borderTopWidth: 1,
    borderTopColor: c.line,
    gap: 7,
  },
  footerNote: { color: c.muted, fontSize: 10, lineHeight: 17, textAlign: 'center', marginTop: 9 },
});
