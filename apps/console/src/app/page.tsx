'use client';

import { GithubSigninButton } from '@/components/GithubSigninButton';
import { authClient } from '@/lib/authClient';

const Index = () => {
  const { data: session } = authClient.useSession();

  console.log(session);

  return <GithubSigninButton />;
};

export default Index;
