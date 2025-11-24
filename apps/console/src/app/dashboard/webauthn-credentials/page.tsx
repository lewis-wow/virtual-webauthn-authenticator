'use client';

import { Page } from '@/components/Page';
import { WebAuthnCredentialsTable } from '@/components/WebAuthnCredentialsTable';
// Assuming you have this from previous context
import { $api } from '@/lib/tsr';
import { Guard } from '@repo/ui/components/Guard/Guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';

const WebAuthnCredentialsPage = () => {
  // --- Queries ---
  const credentialsQuery = $api.api.webAuthnCredentials.list.useQuery({
    queryKey: ['api', 'webAuthnCredentials', 'list'],
  });

  const credentials = credentialsQuery.data?.body || [];

  return (
    <Page pageTitle="WebAuthn Credentials">
      <Card>
        <CardHeader>
          <CardTitle>Passkeys & Hardware Tokens</CardTitle>
          <CardDescription>
            Manage your hardware-backed credentials (YubiKeys, TouchID, Windows
            Hello) stored in Azure Key Vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Guard
            isLoading={credentialsQuery.isLoading}
            error={credentialsQuery.error}
          >
            <WebAuthnCredentialsTable data={credentials} />
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};

export default WebAuthnCredentialsPage;
