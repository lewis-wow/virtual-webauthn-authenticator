import { ErrorAlert } from '@repo/ui/components/Guard/ErrorAlert';
import { NoContentAlert } from '@repo/ui/components/Guard/NoContentAlert';
import { Spinner } from '@repo/ui/components/ui/spinner';
import type { ReactNode } from 'react';
import { match } from 'ts-pattern';

export type GuardProps = {
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: unknown;
  children?: ReactNode;
};

export const Guard = (props: GuardProps) => {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      {match(props)
        .returnType<ReactNode>()
        .with({ isLoading: true }, () => <Spinner />)
        .when(
          ({ error }) => error !== undefined && error !== null,
          () => <ErrorAlert />,
        )
        .with({ isEmpty: true }, () => <NoContentAlert />)
        .otherwise(({ children }) => children)}
    </div>
  );
};
