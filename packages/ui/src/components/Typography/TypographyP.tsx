import { cn } from '@repo/ui/lib/utils';
import type { ReactNode } from 'react';

export type TypographyPProps = {
  children?: ReactNode;
  className?: string;
};

export const TypographyP = ({ children, className }: TypographyPProps) => {
  return (
    <p className={cn('leading-7 not-first:mt-6', className)}>{children}</p>
  );
};
