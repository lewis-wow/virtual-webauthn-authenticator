'use client';

import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [passkeyClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
