import type { HTTPException } from '@repo/validation';
import type { AppRoute } from '@ts-rest/core';
import { isFetchError, isUnknownErrorResponse } from '@ts-rest/react-query/v5';
import type { ReactNode } from 'react';
import { match, P } from 'ts-pattern';

import { ErrorAlert } from './ErrorAlert';
import { HTTPExceptionAlert } from './HTTPExceptionAlert';
import { Loading } from './Loading';
import { NoContentAlert } from './NoContentAlert';

export type GuardProps = {
  contractEndpoint: AppRoute;
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: unknown;
  children?: ReactNode;
};

export const Guard = (props: GuardProps) => {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      {match(props)
        .with({ isLoading: true }, () => <Loading />)
        .when(
          ({ error }) =>
            isFetchError(error) ||
            isUnknownErrorResponse(error, props.contractEndpoint),
          () => <ErrorAlert />,
        )
        .with(
          {
            error: P.intersection(
              P.not(P.union(undefined, null)),
              P.when((value) => typeof value === 'object' && 'code' in value!),
            ),
          },
          ({ error }) => (
            <HTTPExceptionAlert code={(error as HTTPException).code} />
          ),
        )
        .with({ isEmpty: true }, () => <NoContentAlert />)
        .otherwise(({ children }) => children)}
    </div>
  );
};
