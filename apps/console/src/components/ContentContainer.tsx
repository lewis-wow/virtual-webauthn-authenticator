import type { ReactNode } from 'react';
import { match, P } from 'ts-pattern';

import { ErrorAlert } from './ErrorAlert';
import { Loading } from './Loading';
import { NoContentAlert } from './NoContentAlert';

export type ContentContainerProps = {
  isLoading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  children?: ReactNode;
};

export const ContentContainer = ({
  isLoading,
  error,
  isEmpty,
  children,
}: ContentContainerProps) => {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      {match({
        isLoading,
        error,
        isEmpty,
        children,
      })
        .with({ isLoading: true }, () => <Loading />)
        .with({ error: P.not(P.union(undefined, null)) }, () => <ErrorAlert />)
        .with({ isEmpty: true }, () => <NoContentAlert />)
        .otherwise(() => children)}
    </div>
  );
};
