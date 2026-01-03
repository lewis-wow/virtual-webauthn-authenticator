'use client';

import { authClient } from '@/lib/authClient';
import { GithubSignInButton } from '@repo/ui/components/GithubSignInButton';
import Link from 'next/link';

export const SigninPage = () => {
  const handleGithubSignIn = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign In
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Welcome back! Please sign in using your GitHub account.
        </p>
        <GithubSignInButton handleGithubSignIn={handleGithubSignIn} />
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
