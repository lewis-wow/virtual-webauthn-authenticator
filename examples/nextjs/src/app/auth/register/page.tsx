import { RegisterForm } from '@/components/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Create Account</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Register with email and password. You can add passkey authentication
        after creating your account.
      </p>
      <RegisterForm />
      <div className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline">
          Login
        </Link>
      </div>
    </div>
  );
}
