import { LoginForm } from '@/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Login</h1>
      <LoginForm />
      <div className="text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/auth/register" className="underline">
          Register
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
