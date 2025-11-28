import { AuthGuard } from '@/components/AuthGuard';
import { BrowserExtensionPage } from '@/components/pages/BrowserExtensionPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <BrowserExtensionPage />
    </AuthGuard>
  );
};
