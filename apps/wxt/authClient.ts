import { env } from '@/env';
import { jwtClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: env.WXT_API_BASE_URL,
  plugins: [jwtClient()],
  fetchOptions: {
    // For browser extensions, we need to include credentials for cross-origin requests
    // This allows the auth server cookies to be sent
    credentials: 'include',
  },
});
