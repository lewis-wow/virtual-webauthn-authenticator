'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getQueryClient } from './lib/getQueryClient';
import { $api, $authServer } from './lib/tsr';

export type ProvidersProps = {
  children?: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <$authServer.ReactQueryProvider>
        <$api.ReactQueryProvider>{children}</$api.ReactQueryProvider>
      </$authServer.ReactQueryProvider>
    </QueryClientProvider>
  );
};
