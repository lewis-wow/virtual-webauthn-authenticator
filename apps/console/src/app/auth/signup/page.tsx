import { GithubSigninButton } from '@/components/GithubSigninButton';
import Link from 'next/link';

const SignupPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create an Account
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Join us! Create your account by signing up with GitHub.
        </p>
        <GithubSigninButton />
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
