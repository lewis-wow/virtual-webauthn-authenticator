'use client';

import { GithubSigninButton } from '@/components/GithubSigninButton';
import { Guard } from '@/components/Guard/Guard';
import { Page } from '@/components/Page';
import { authClient } from '@/lib/authClient';
import { tsr } from '@/lib/tsr';

const Index = () => {
  const { data: session } = authClient.useSession();

  const healthcheckQuery = tsr.api.healthcheck.get.useQuery({
    queryKey: ['tsr.api.healthcheck.get'],
  });

  console.log('session', session);

  return (
    <Page>
      <Guard
        contractEndpoint={healthcheckQuery.contractEndpoint}
        isEmpty={healthcheckQuery.data?.body === undefined}
        isLoading={healthcheckQuery.isLoading}
        error={healthcheckQuery.error}
      >
        {JSON.stringify(healthcheckQuery.data)}
      </Guard>

      <GithubSigninButton />
    </Page>
  );
};

export default Index;
