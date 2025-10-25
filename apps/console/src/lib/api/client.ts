import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import type { paths } from './v1';

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const $api = createClient(fetchClient);
