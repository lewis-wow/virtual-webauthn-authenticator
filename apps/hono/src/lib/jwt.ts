import { env } from '@/env';
import { Jwt } from '@repo/auth';

import { Lazy } from './utils/Lazy';

export const jwt = new Lazy(
  'jwt',
  () =>
    new Jwt({
      authServerBaseURL: env.AUTH_SERVER_BASE_URL,
    }),
);
