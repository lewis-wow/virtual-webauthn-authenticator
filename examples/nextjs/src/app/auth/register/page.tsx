import { RegisterForm } from '@/components/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Register</h1>
      <RegisterForm />
      <div className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline">
          Login
        </Link>
      </div>
      <div className="text-sm text-muted-foreground">
        Or{' '}
        <Link href="/auth/passkey" className="underline">
          use Passkey
        </Link>
      </div>
    </div>
  );
}
