import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export const StackPredefinedGap = ['between', 'around', 'evenly'] as const;
export type StackPredefinedGap = (typeof StackPredefinedGap)[number];

type StackProps = {
  direction: 'row' | 'column';
  gap: StackPredefinedGap | (string & {});
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
};

export const Stack = ({
  children,
  className,
  direction,
  gap,
  asChild,
  ...props
}: StackProps) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component
      className={cn(
        'flex h-full w-full',
        {
          'flex-col': direction === 'column',
          'flex-row': direction === 'row',
          'justify-between': gap === 'between',
          'justify-around': gap === 'around',
          'justify-evenly': gap === 'evenly',
        },
        className,
      )}
      style={{
        gap: (StackPredefinedGap as readonly string[]).includes(gap)
          ? undefined
          : gap,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};
