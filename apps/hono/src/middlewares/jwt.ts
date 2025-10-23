import { validator as zValidator } from 'hono-openapi';
import { every } from 'hono/combine';
import { jwt as honoJwt } from 'hono/jwt';
import type { ExtractInput } from 'hono/types';
import z from 'zod';

const authorizationHeaderMiddleware = zValidator(
  'header',
  z.object({
    Authorization: z.jwt(),
  }),
);

type t = ExtractInput<typeof authorizationHeaderMiddleware>;

export const jwt: typeof authorizationHeaderMiddleware = every(
  authorizationHeaderMiddleware,
  honoJwt({ secret: 'secret' }),
);
