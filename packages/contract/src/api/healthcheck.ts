import { JwtPayloadSchema } from '@repo/auth/validation';
import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

const c = initContract();

export const healthcheckRouter = c.router({
  get: {
    method: 'GET',
    path: '/healthcheck',
    responses: {
      200: Schema.standardSchemaV1(
        Schema.Struct({
          healthy: Schema.Literal(true),
          jwtPayload: Schema.NullOr(JwtPayloadSchema),
        }),
      ),
    },
  },
});
