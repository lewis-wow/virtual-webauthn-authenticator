import {
  QueryClient,
  MutationCache,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';

const makeQueryClient = () => {
  // eslint-disable-next-line prefer-const
  let client: QueryClient;

  const mutationCache = new MutationCache({
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ['api', 'logs', 'list'],
      });
    },
  });

  client = new QueryClient({
    mutationCache, // Pass the cache here
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });

  return client;
};

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};
