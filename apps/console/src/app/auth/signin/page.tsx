import { GithubSigninButton } from '@/components/GithubSigninButton';
import Link from 'next/link';

const SigninPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign In
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Welcome back! Please sign in using your GitHub account.
        </p>
        <GithubSigninButton />
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
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

export default SigninPage;
