import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { authClient } from '../authClient';
import type { paths } from './v1';

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  fetch: async (request) => {
    const { data } = await authClient.token();
    request.headers.append('Authorization', `Bearer ${data?.token}`);

    return await fetch(request);
  },
});

export const $api = createClient(fetchClient);
