import { AuthGuard } from '@/components/AuthGuard';
import { SigninPage } from '@/components/pages/SigninPage';

export default () => {
  return (
    <AuthGuard requireAuthState="unauthenticated">
      <SigninPage />
    </AuthGuard>
  );
};
