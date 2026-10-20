import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { Action, Copy, EmptyState, Page, ScreenTitle } from '../../src/components/ui';
import { colors } from '../../src/theme';

export default function Account() {
  const [error, setError] = useState(false);
  return (
    <Page>
      <ScreenTitle
        eyebrow="WELCOME TO OZWASHROOM"
        title="Your account"
        subtitle="A better space starts with the essentials."
      />
      <EmptyState
        icon="person-outline"
        title="Good to see you here"
        message="Account sign-in and order history will arrive in a future release. You can browse products, save a cart on this device and use Shopify checkout as a guest."
      />
      <View style={{ marginTop: 24, gap: 14, alignItems: 'center' }}>
        <Action
          label="Visit Ozwashroom website"
          icon="open-outline"
          secondary
          onPress={() => {
            setError(false);
            Linking.openURL('https://www.ozwashroom.com.au').catch(() => setError(true));
          }}
        />
        <Copy style={{ color: colors.muted, fontSize: 12 }}>
          Opens the Ozwashroom website in your browser.
        </Copy>
        {error && (
          <Copy accessibilityRole="alert" style={{ color: colors.red }}>
            Couldn’t open the website. Try again later.
          </Copy>
        )}
      </View>
    </Page>
  );
}
