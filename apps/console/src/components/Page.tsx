'use client';
import { Stack } from '@/components/Stack';
import type { ReactNode } from 'react';

export type PageProps = {
  children?: ReactNode;
  title?: string;
};

export const Page = ({ children, title }: PageProps) => {
  return (
    <Stack direction="column" gap="1rem" className="bg-background">
      <Stack className="container mx-auto py-8" direction="column" gap="1rem">
        <main className="w-full flex-1">{children}</main>
      </Stack>
    </Stack>
  );
};
