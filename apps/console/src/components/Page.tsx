'use client';

import type { ReactNode } from 'react';

import { Stack } from './Stack';
import { TypographyH1 } from './Typography';

export type PageProps = {
  children?: ReactNode;
  title?: string;
  description?: string;
};

export const Page = ({ children, title, description }: PageProps) => {
  return (
    <div className="container min-h-screen bg-background p-8 mx-auto">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <TypographyH1>{title}</TypographyH1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </header>
        <Stack direction="column" gap="1rem" asChild>
          <main>{children}</main>
        </Stack>
      </div>
    </div>
  );
};
