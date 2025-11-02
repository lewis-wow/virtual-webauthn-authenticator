'use client';

import { GithubSigninButton } from '@/components/GithubSigninButton';
import { Guard } from '@/components/Guard/Guard';
import { Page } from '@/components/Page';
import { authClient } from '@/lib/authClient';
import { tsr } from '@/lib/tsr';

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
