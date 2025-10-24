import { env } from '@/env';
import { createAuth } from '@repo/better-auth/server';

export const auth = createAuth({
  baseURL: env.BASE_URL,
  basePath: '/auth',
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
});
