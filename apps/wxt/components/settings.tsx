import { authClient } from '@/authClient';
import { env } from '@/env';
import { Button } from '@repo/ui/components/Button';
import { GithubSignInButton } from '@repo/ui/components/GithubSignInButton';
import { Page } from '@repo/ui/components/Page';
import { Stack } from '@repo/ui/components/Stack';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Separator } from '@repo/ui/components/ui/separator';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

export const Settings = () => {
  const { data: session, isPending, refetch } = authClient.useSession();

  console.log('session', session);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Listen for auth completion from OAuth callback
  useEffect(() => {
    const handleStorageChange = (
      changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
      areaName: string,
    ) => {
      if (areaName === 'local' && changes['auth-completed']) {
        // Auth completed in callback window, refetch session
        refetch();
        setIsAuthenticating(false);
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => browser.storage.onChanged.removeListener(handleStorageChange);
  }, [refetch]);

  const handleGithubSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: 'github',
      },
      // {
      //   onRequest: () => {
      //     setIsAuthenticating(true);
      //   },
      //   onSuccess: async () => {
      //     setIsAuthenticating(false);
      //     // Refetch session after successful signin
      //     refetch();
      //   },
      //   onError: (ctx) => {
      //     console.error('Failed to initiate GitHub sign-in:', ctx.error);
      //     setIsAuthenticating(false);
      //   },
      // },
    );
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    // Clear stored session
    await browser.storage.local.remove([
      'better-auth-session',
      'auth-completed',
    ]);
  };

  return (
    <Page title={env.WXT_APP_NAME}>
      <Stack direction="column" gap="1rem" className="p-4">
        {isPending || isAuthenticating ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : session ? (
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>You are signed in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name}
                  />
                  <AvatarFallback>
                    {session.user.name?.substring(0, 2).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <Separator />
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Connect your GitHub account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GithubSignInButton handleGithubSignIn={handleGithubSignIn} />
            </CardContent>
          </Card>
        )}
      </Stack>
    </Page>
  );
};
