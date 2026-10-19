import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { StoreProvider } from '../src/state/Store';
import { Header } from '../src/components/ui';
import { colors } from '../src/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator accessibilityLabel="Loading app" color={colors.green} />
      </View>
    );
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Header />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="collection/[id]" />
          <Stack.Screen name="product/[id]" />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
