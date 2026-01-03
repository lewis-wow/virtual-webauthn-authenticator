'use client';

import type { MaybePromise } from '@repo/types';
import { Button } from '@repo/ui/components/Button';
import { FaGithub } from 'react-icons/fa';

export type GithubSigninButtonProps = {
  handleGithubSignIn: () => MaybePromise<void>;
};

export const GithubSignInButton = ({
  handleGithubSignIn,
}: GithubSigninButtonProps) => {
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
