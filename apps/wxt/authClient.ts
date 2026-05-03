import { env } from '@/env';
import { jwtClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: env.WXT_API_BASE_URL,
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: 'include',
  },
});
