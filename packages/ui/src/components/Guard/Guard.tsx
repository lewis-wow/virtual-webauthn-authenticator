import { ErrorAlert } from '@repo/ui/components/Guard/ErrorAlert';
import { NoContentAlert } from '@repo/ui/components/Guard/NoContentAlert';
import { Spinner } from '@repo/ui/components/ui/spinner';
import type { ReactNode } from 'react';
import { match } from 'ts-pattern';

export type GuardProps = {
  isLoading?: boolean;
  isEmpty?: boolean;
  EmptyComponent?: ReactNode;
  error?: unknown;
  ErrorComponent?: ReactNode;
  children?: ReactNode;
};

export const Guard = (props: GuardProps) => {
  return match(props)
    .with({ isLoading: true }, () => (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        <Spinner />
      </div>
    ))
    .when(
      ({ error }) => error !== undefined && error !== null,
      () => (
        <div className="flex h-full w-full flex-1 items-center justify-center">
          {props.ErrorComponent !== undefined ? (
            props.ErrorComponent
          ) : (
            <ErrorAlert />
          )}
        </div>
      ),
    )
    .with({ isEmpty: true }, () => (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        {props.EmptyComponent !== undefined ? (
          props.EmptyComponent
        ) : (
          <NoContentAlert />
        )}
      </div>
    ))
    .otherwise(({ children }) => children);
};
