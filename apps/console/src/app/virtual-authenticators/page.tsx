'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { VirtualAuthenticatorsPage } from '@/components/pages/VirtualAuthenticatorsPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <VirtualAuthenticatorsPage />
    </AuthGuard>
  );
};
