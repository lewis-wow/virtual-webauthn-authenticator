import type { ReactNode } from 'react';
import { match } from 'ts-pattern';

import { ErrorAlert } from './ErrorAlert';
import { Loading } from './Loading';
import { NoContentAlert } from './NoContentAlert';

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
        .with({ isLoading: true }, () => <Loading />)
        .when(
          ({ error }) => error !== undefined && error !== null,
          () => <ErrorAlert />,
        )
        .with({ isEmpty: true }, () => <NoContentAlert />)
        .otherwise(({ children }) => children)}
    </div>
  );
};
