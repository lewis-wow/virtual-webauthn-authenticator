'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { WebAuthnCredentialsPage } from '@/components/pages/WebAuthnCredentialsPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <WebAuthnCredentialsPage />
    </AuthGuard>
  );
};
