import {
  QueryClient,
  MutationCache,
  // 1. Import MutationCache
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';

const makeQueryClient = () => {
  // 2. Declare client variable first so we can reference it inside the cache callback
  let client: QueryClient;

  // 3. Define the Global Mutation Cache
  const mutationCache = new MutationCache({
    // onSuccess fires after ANY mutation completes successfully
    onSuccess: (_data, _variables, _context, _mutation) => {
      client.invalidateQueries({
        queryKey: ['api', 'auditLogs', 'list'], // Same as 'api.auditLogs.list'.split('.')
      });
    },

    // Optional: Use onSettled if you want to invalidate even if the mutation FAILED
    // onSettled: () => {
    //   client.invalidateQueries({ queryKey: ['api', 'auditLogs', 'list'] });
    // }
  });

  // 4. Instantiate the client with the mutationCache
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
