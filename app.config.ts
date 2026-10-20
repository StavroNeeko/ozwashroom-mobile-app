import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Ozwashroom',
  slug: config.slug ?? 'ozwashroom',
  // Keep an owner's locally linked project metadata while giving fresh checkouts
  // the real project ID confirmed in this conversation, rather than a placeholder.
  extra: {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      projectId: config.extra?.eas?.projectId ?? '9ed21a6b-4187-4a63-995e-5562689020c0',
    },
  },
  android: {
    ...config.android,
    adaptiveIcon: {
      ...config.android?.adaptiveIcon,
      foregroundImage: './assets/android-adaptive-foreground.png',
      backgroundColor: '#FFFFFF',
    },
  },
});
