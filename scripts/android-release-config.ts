export type AndroidReleaseInputs = {
  profile: string;
  projectId?: string;
  packageName?: string;
  shopifyDomain?: string;
  hasPublicToken: boolean;
  icon?: { width: number; height: number };
};

// Used by both the local build command and EAS's Android post-install hook.
// Error messages deliberately contain no token values.
export function androidReleaseIssues(input: AndroidReleaseInputs): string[] {
  const issues: string[] = [];
  if (!['preview', 'production'].includes(input.profile))
    issues.push('Use the preview or production Android build profile.');
  if (!input.projectId || !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(input.projectId))
    issues.push('Link the app to your Expo account with npx eas-cli@latest init.');
  if (!input.packageName || !/^[a-z][a-z\d_]*(\.[a-z][a-z\d_]*){2,}$/.test(input.packageName))
    issues.push('Set a valid Android package identifier in app.json.');
  if (input.shopifyDomain !== 'ozwashroom.myshopify.com' || !input.hasPublicToken)
    issues.push(
      'Configure the live Ozwashroom domain and public Storefront token for this build environment.',
    );
  if (
    !input.icon ||
    !Number.isInteger(input.icon.width) ||
    input.icon.width < 1 ||
    input.icon.width !== input.icon.height
  )
    issues.push('The Android icon must be a readable square PNG.');
  else if (input.profile === 'production' && input.icon.width < 1024)
    issues.push(
      'Replace assets/icon.png with an approved square PNG at least 1024×1024 before a Google Play build.',
    );
  return issues;
}
