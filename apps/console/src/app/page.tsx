'use client';

import { GithubSigninButton } from '@/components/GithubSigninButton';
import { $api } from '@/lib/api/client';
import { authClient } from '@/lib/authClient';

const Index = () => {
  const { data: session } = authClient.useSession();

  const indexQuery = $api.useQuery('get', '/api');

  console.log('session', session);
  console.log('indexQuery', indexQuery.data);

  return <GithubSigninButton />;
};

export default Index;
