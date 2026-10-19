import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '../../src/components/ui';
import { colors, fonts } from '../../src/theme';
import { useStore } from '../../src/state/Store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { count } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: '#839186',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: 65 + Math.max(insets.bottom, 10),
          paddingTop: 9,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 10, marginTop: 4 },
        tabBarItemStyle: { maxWidth: 220 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Icon name="home-outline" color={focused ? colors.green : '#839186'} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused }) => (
            <Icon name="grid-outline" color={focused ? colors.green : '#839186'} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <Icon name="search-outline" color={focused ? colors.green : '#839186'} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: count || undefined,
          tabBarIcon: ({ focused }) => (
            <Icon name="bag-handle-outline" color={focused ? colors.green : '#839186'} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <Icon name="person-outline" color={focused ? colors.green : '#839186'} />
          ),
        }}
      />
    </Tabs>
  );
}
