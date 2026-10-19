// Public overrides; the header defaults to the bundled official website logo.
export const brand = {
  logoUrl: process.env.EXPO_PUBLIC_BRAND_LOGO_URL?.trim(),
  contactPhone: process.env.EXPO_PUBLIC_CONTACT_PHONE?.trim() || '1300 652 725',
  contactUrl: process.env.EXPO_PUBLIC_CONTACT_URL?.trim() || 'https://www.ozwashroom.com.au',
};
