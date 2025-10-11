import {
  Button as ButtonUI,
  type buttonVariants,
} from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';
import { match } from 'ts-pattern';
import { Loading } from './Loading';
import { cn } from '../lib/utils';
import Link from 'next/link';

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
        .with({ isLoading: true }, () => <Loading />)
        .when(
          ({ href }) => href !== undefined,
          ({ href }) => <Link href={href!}>{children}</Link>,
        )
        .otherwise(() => children)}
    </ButtonUI>
  );
};
