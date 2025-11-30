import { AuthGuard } from '@/components/AuthGuard';
import { SignupPage } from '@/components/pages/SignupPage';

export default () => {
  return (
    <AuthGuard requireAuthState="unauthenticated">
      <SignupPage />
    </AuthGuard>
  );
};
