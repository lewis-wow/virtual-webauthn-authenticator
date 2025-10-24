import type { BetterAuthOptions } from 'better-auth';
import { apiKey } from 'better-auth/plugins';

export const authServerConfig = {
  plugins: [
    apiKey({
      requireName: true,
      defaultPrefix: 'virtual-webauthn-authenticator_',
    }),
  ],
  advanced: {
    generateId: false,
  },
} satisfies BetterAuthOptions;
