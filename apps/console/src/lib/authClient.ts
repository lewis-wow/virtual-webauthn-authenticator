import { apiKeyClient, jwtClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [jwtClient(), apiKeyClient()],
});
