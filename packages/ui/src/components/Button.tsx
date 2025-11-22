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
  href?: string;
  asChild?: boolean;
} & ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  isLoading,
  children,
  className,
  href,
  asChild,
  ...restProps
}: ButtonProps) => {
  const _asChild = asChild ?? !!href;

  return (
    <ButtonUI
      {...restProps}
      asChild={_asChild}
      className={cn('cursor-pointer', className)}
    >
      {match({ isLoading, href })
        .with({ isLoading: true }, () => <Spinner />)
        .otherwise(() => children)}
    </ButtonUI>
  );
};
