import { env } from '@/env';
import { Jwt } from '@repo/better-auth';

export const jwt = new Jwt({
  baseUrl: env.BASE_URL,
});
