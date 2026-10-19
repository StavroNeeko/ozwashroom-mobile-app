import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as c, fonts as f } from '../theme';
import { useStore } from '../state/Store';
import { brand } from '../brand';

export function Copy({ children, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[styles.copy, style]}>
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 22,
  color = c.ink,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: React.ComponentProps<typeof Ionicons>['color'];
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function Action({
  label,
  onPress,
  secondary,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        secondary && styles.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Copy style={[styles.actionLabel, secondary && { color: c.primary }]}>{label}</Copy>
      {icon && <Icon name={icon} size={17} color={secondary ? c.primary : c.white} />}
    </Pressable>
  );
}
export function Header() {
  const { count } = useStore();
  const insets = useSafeAreaInsets();
  const [logoFailed, setLogoFailed] = useState(false);
  const [contactError, setContactError] = useState(false);
  return (
    <View style={{ backgroundColor: c.white, paddingTop: insets.top }}>
      <View style={styles.header}>
        <View style={styles.brandColumn}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Ozwashroom home"
            onPress={() => router.navigate('/')}
            style={styles.brand}
          >
            {brand.logoUrl && !logoFailed ? (
              <Image
                source={{ uri: brand.logoUrl }}
                accessibilityLabel="Ozwashroom logo"
                resizeMode="contain"
                style={styles.brandImage}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <Copy style={styles.brandText}>OZWASHROOM</Copy>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={
              brand.contactPhone
                ? `Call Ozwashroom on ${brand.contactPhone}`
                : 'Contact us on the Ozwashroom website'
            }
            onPress={() => {
              setContactError(false);
              const phone = brand.contactPhone?.replace(/[^+\d]/g, '');
              Linking.openURL(phone ? `tel:${phone}` : brand.contactUrl).catch(() =>
                setContactError(true),
              );
            }}
            style={styles.contactLink}
          >
            <Icon
              name={brand.contactPhone ? 'call-outline' : 'chatbubble-ellipses-outline'}
              size={13}
              color={c.primary}
            />
            <Copy style={styles.contactText}>{brand.contactPhone || 'Contact us'}</Copy>
            {!brand.contactPhone && <Icon name="open-outline" size={10} color={c.primary} />}
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Search products"
            onPress={() => router.navigate('/search')}
            style={styles.iconButton}
          >
            <Icon name="search-outline" />
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Cart, ${count} items`}
            onPress={() => router.navigate('/cart')}
            style={styles.iconButton}
          >
            <Icon name="bag-handle-outline" />
            {count > 0 && (
              <View style={styles.badge}>
                <Copy style={styles.badgeText}>{count}</Copy>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      {contactError && (
        <Copy accessibilityRole="alert" style={styles.contactError}>
          Couldn’t open contact details. Please try again.
        </Copy>
      )}
    </View>
  );
}
export function Page({ children }: React.PropsWithChildren) {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>{children}</View>
    </ScrollView>
  );
}
export function ScreenTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ gap: 7, marginBottom: 26 }}>
      {eyebrow && <Copy style={styles.eyebrow}>{eyebrow}</Copy>}
      <Copy accessibilityRole="header" style={styles.title}>
        {title}
      </Copy>
      {subtitle && <Copy style={{ color: c.muted, lineHeight: 22 }}>{subtitle}</Copy>}
    </View>
  );
}
export function SourceNotice() {
  const { catalog } = useStore();
  if (!catalog) return null;
  return (
    <View style={styles.notice}>
      <Icon
        name={catalog.source === 'sample' ? 'flask-outline' : 'checkmark-circle-outline'}
        size={16}
      />
      <Copy style={styles.noticeText}>
        {catalog.source === 'sample'
          ? 'Sample catalogue · Illustrative products & AUD prices'
          : 'Shopify catalogue · Prices in AUD'}
        {catalog.truncated ? ' · Showing the first 1,000 products per collection' : ''}
      </Copy>
    </View>
  );
}
export function EmptyState({
  title,
  message,
  action,
  onAction,
  icon = 'leaf-outline',
}: {
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={28} />
      </View>
      <Copy style={styles.emptyTitle}>{title}</Copy>
      <Copy style={styles.emptyMessage}>{message}</Copy>
      {action && onAction && <Action label={action} onPress={onAction} secondary />}
    </View>
  );
}
export function CatalogBoundary({ children }: React.PropsWithChildren) {
  const { loading, error, catalog, refresh } = useStore();
  if (loading)
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading catalogue"
        style={styles.empty}
      >
        <ActivityIndicator color={c.primary} size="large" />
        <Copy>Finding your washroom essentials…</Copy>
      </View>
    );
  if (error)
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="We couldn’t load the catalogue"
        message={error}
        action="Try again"
        onAction={refresh}
      />
    );
  if (!catalog?.products.length)
    return (
      <EmptyState
        title="A little quiet here"
        message="There are no published products yet. Check back soon."
        action="Refresh catalogue"
        onAction={refresh}
      />
    );
  return <>{children}</>;
}
export const styles = StyleSheet.create({
  copy: { fontFamily: f.regular, color: c.ink, fontSize: 14 },
  page: { flex: 1, backgroundColor: c.canvas },
  pageContent: { paddingBottom: 40 },
  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  header: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 22,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandColumn: { flexShrink: 1, paddingTop: 12, paddingBottom: 4 },
  brand: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 35 },
  brandImage: { width: 185, height: 35 },
  brandText: {
    fontFamily: f.bold,
    letterSpacing: 0.3,
    fontSize: 21,
    lineHeight: 30,
    color: c.primary,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  contactText: { color: c.primary, fontSize: 12, fontFamily: f.medium },
  contactError: { color: c.red, fontSize: 12, textAlign: 'center', padding: 8 },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconButton: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: c.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: c.white, fontSize: 10, fontFamily: f.bold },
  action: {
    backgroundColor: c.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'flex-start',
  },
  secondary: { backgroundColor: c.soft },
  actionLabel: { color: c.white, fontFamily: f.bold, fontSize: 13 },
  eyebrow: { fontSize: 10, fontFamily: f.bold, color: c.primary, letterSpacing: 2 },
  title: { fontSize: 32, fontFamily: f.bold, letterSpacing: -1 },
  notice: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 13,
    backgroundColor: '#EDF5FD',
    borderRadius: 7,
    marginBottom: 24,
  },
  noticeText: { fontSize: 11, color: '#436384', flex: 1, lineHeight: 17 },
  empty: {
    padding: 30,
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: c.white,
    borderRadius: 16,
    marginVertical: 12,
  },
  emptyIcon: { padding: 14, backgroundColor: c.soft, borderRadius: 40 },
  emptyTitle: { fontFamily: f.bold, fontSize: 20, textAlign: 'center' },
  emptyMessage: { color: c.muted, textAlign: 'center', maxWidth: 460, lineHeight: 22 },
});
