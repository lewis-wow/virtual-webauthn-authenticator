'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { WebAuthnPublicKeyCredentialsPage } from '@/components/pages/WebAuthnPublicKeyCredentialsPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <WebAuthnPublicKeyCredentialsPage />
    </AuthGuard>
  );
};
