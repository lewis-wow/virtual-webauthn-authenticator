import { cn } from '@repo/ui/lib/utils';
import type { ReactNode } from 'react';

export type TypographyH1Props = {
  children?: ReactNode;
  className?: string;
};

export const TypographyH1 = ({ children, className }: TypographyH1Props) => {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight text-balance',
        className,
      )}
    >
      {children}
    </h1>
  );
};
