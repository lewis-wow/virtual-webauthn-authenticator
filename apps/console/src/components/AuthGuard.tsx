'use client';

import { $api } from '@/lib/tsr';
import { Guard } from '@repo/ui/components/Guard/Guard';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export type AuthState = 'authenticated' | 'unauthenticated';

export type AuthGuardProps = {
  requireAuthState?: AuthState;
  children?: ReactNode;
};

export const AuthGuard = ({ requireAuthState, children }: AuthGuardProps) => {
  const router = useRouter();
  // 1. Add state to track if a redirect has been triggered
  const [isRedirecting, setIsRedirecting] = useState(false);

  const profileGetQuery = $api.api.profile.get.useQuery({
    queryKey: ['api', 'profile', 'get'],
    enabled: !!requireAuthState,
  });

  const isAuthenticated = !!profileGetQuery.data?.body.jwtPayload;

  console.log('RERENDER!');

  useEffect(() => {
    // If the query is loading, we do nothing yet
    if (profileGetQuery.isFetching) {
      return;
    }

    // 2. Determine if we need to redirect
    const shouldRedirectToSignin =
      requireAuthState === 'authenticated' && !isAuthenticated;
    const shouldRedirectToHome =
      requireAuthState === 'unauthenticated' && isAuthenticated;

    if (shouldRedirectToSignin) {
      setIsRedirecting(true); // Keep loading state active
      router.push('/auth/signin');
      return;
    }

    if (shouldRedirectToHome) {
      setIsRedirecting(true); // Keep loading state active
      router.push('/');
      return;
    }

    // Optional: If we made it here, no redirect happened.
    // If you had logic that might re-evaluate, you'd set isRedirecting(false) here,
    // but typically for an auth guard, once you're good, you're good.
  }, [requireAuthState, isAuthenticated, profileGetQuery.isFetching, router]);

  // 3. Combine query loading AND redirecting state
  const shouldShowLoader =
    (!!requireAuthState && profileGetQuery.isFetching) || isRedirecting;

  return <Guard isLoading={shouldShowLoader}>{children}</Guard>;
};
