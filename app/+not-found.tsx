import { router } from 'expo-router';
import { EmptyState, Page } from '../src/components/ui';
export default function NotFound() {
  return (
    <Page>
      <EmptyState
        title="This page has moved"
        message="Let’s get you back to your washroom essentials."
        action="Back to home"
        onAction={() => router.replace('/')}
      />
    </Page>
  );
}
