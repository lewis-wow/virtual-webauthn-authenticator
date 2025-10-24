'use client';

import { Button } from '@/components/Button';
import { authClient } from '@/lib/authClient';
import { FaGithub } from 'react-icons/fa';

export const GithubSigninButton = () => {
  const handleGithubSignIn = async () => {
    const data = await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/',
    });

    console.log(data);
  };

  return (
    <Button
      onClick={handleGithubSignIn}
      className="flex w-full items-center justify-center gap-3 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      size="lg"
    >
      <FaGithub className="h-5 w-5" />
      Sign in via GitHub
    </Button>
  );
};
