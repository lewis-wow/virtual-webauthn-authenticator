import { assertSchema } from '@repo/assert';
import z from 'zod';

export const fromBearerToken = (bearerToken: unknown): string => {
  assertSchema(bearerToken, z.string().startsWith('Bearer '));

  const token = bearerToken.replace('Bearer ', '');

  return token;
};
