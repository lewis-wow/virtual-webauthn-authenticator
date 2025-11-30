'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { LogsPage } from '@/components/pages/LogsPage';

export default () => {
  return (
    <AuthGuard requireAuthState="authenticated">
      <LogsPage />
    </AuthGuard>
  );
};
