'use client';

import { PasskeyAuth } from '@/components/passkey-auth';
import { useSession } from '@/lib/auth-client';
import { Button } from '@repo/ui/components/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManagePasskeysPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Manage Passkeys</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Add a passkey to your account for faster and more secure sign-ins using
        biometric authentication or security keys
      </p>
      <PasskeyAuth mode="add" />
      <div className="text-sm text-muted-foreground">
        <Link href="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
