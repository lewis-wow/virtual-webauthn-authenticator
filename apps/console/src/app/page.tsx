'use client';

import { GithubSigninButton } from '@/components/GithubSigninButton';
import { authClient } from '@/lib/authClient';
import { tsr } from '@/lib/tsr';
import { Guard } from '@repo/ui/components/Guard/Guard';
import { Page } from '@repo/ui/components/Page';

const Index = () => {
  const { data: session } = authClient.useSession();

  const healthcheckQuerySession = tsr.api.healthcheck.get.useQuery({
    queryKey: ['tsr.api.healthcheck.get'],
  });

  console.log('session', session);

  return (
    <Page>
      <Guard
        isEmpty={healthcheckQuerySession.data?.body === undefined}
        isLoading={healthcheckQuerySession.isLoading}
        error={healthcheckQuerySession.error}
      >
        {JSON.stringify(healthcheckQuerySession.data)}
      </Guard>

      <GithubSigninButton />
    </Page>
  );
};

export default Index;
