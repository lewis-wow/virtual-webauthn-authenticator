'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@repo/ui/components/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
        <h1 className="text-4xl font-bold">Welcome to Next.js Auth Example</h1>
        <p className="text-lg text-muted-foreground">
          Please sign in to continue
        </p>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="secondary">Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-4xl font-bold">Welcome Back!</h1>

      <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
        <h2 className="text-2xl font-semibold">Session Information</h2>

        <div className="space-y-2">
          <div>
            <span className="font-medium">User ID:</span>
            <p className="text-sm text-muted-foreground break-all">
              {session.user.id}
            </p>
          </div>

          <div>
            <span className="font-medium">Name:</span>
            <p className="text-sm text-muted-foreground">{session.user.name}</p>
          </div>

          <div>
            <span className="font-medium">Email:</span>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>

          <div>
            <span className="font-medium">Session ID:</span>
            <p className="text-sm text-muted-foreground break-all">
              {session.session.id}
            </p>
          </div>

          <div>
            <span className="font-medium">Expires At:</span>
            <p className="text-sm text-muted-foreground">
              {new Date(session.session.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full mt-4"
        >
          Sign Out
        </Button>
      </div>

      <Link href="/profile/passkeys">
        <Button variant="outline">Manage Passkeys</Button>
      </Link>
    </div>
  );
}
