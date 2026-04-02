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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const profileGetQuery = $api.api.profile.get.useQuery({
    queryKey: ['api', 'profile', 'get'],
    enabled: !!requireAuthState,
  });

  const isAuthenticated = !!profileGetQuery.data?.body.jwtPayload;

  useEffect(() => {
    if (profileGetQuery.isFetching) {
      return;
    }

    const shouldRedirectToSignin =
      requireAuthState === 'authenticated' && !isAuthenticated;
    const shouldRedirectToHome =
      requireAuthState === 'unauthenticated' && isAuthenticated;

    if (shouldRedirectToSignin) {
      setIsRedirecting(true);
      router.push('/auth/signin');
      return;
    }

    if (shouldRedirectToHome) {
      setIsRedirecting(true);
      router.push('/');
      return;
    }
  }, [requireAuthState, isAuthenticated, profileGetQuery.isFetching, router]);

  const shouldShowLoader =
    (!!requireAuthState && profileGetQuery.isFetching) || isRedirecting;

  return <Guard isLoading={shouldShowLoader}>{children}</Guard>;
};
