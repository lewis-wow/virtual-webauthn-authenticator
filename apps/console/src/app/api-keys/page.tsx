import { AuthGuard } from '@/components/AuthGuard';
import { ApiKeysPage } from '@/components/pages/ApiKeysPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <ApiKeysPage />
    </AuthGuard>
  );
};
