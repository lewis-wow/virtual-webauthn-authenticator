import {
  Button as ButtonUI,
  type buttonVariants,
} from '@repo/ui/components/ui/button';
import { Spinner } from '@repo/ui/components/ui/spinner';
import { cn } from '@repo/ui/lib/utils';
import { type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';
import { match } from 'ts-pattern';

export type ButtonProps = {
  isLoading?: boolean;
  asChild?: boolean;
} & ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  isLoading,
  children,
  className,
  asChild,
  ...restProps
}: ButtonProps) => {
  return (
    <ButtonUI
      {...restProps}
      asChild={!isLoading && asChild}
      className={cn('cursor-pointer', className)}
    >
      {match({ isLoading })
        .with({ isLoading: true }, () => <Spinner />)
        .otherwise(() => children)}
    </ButtonUI>
  );
};
