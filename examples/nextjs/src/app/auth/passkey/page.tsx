import { PasskeyAuth } from '@/components/passkey-auth';
import Link from 'next/link';

export default function PasskeyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Passkey Sign In</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Sign in using biometric authentication or security keys
      </p>
      <PasskeyAuth mode="signin" />
      <div className="text-sm text-muted-foreground">
        <Link href="/auth/login" className="underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
