import { z } from 'zod';

import { ApiKeyJwtPayloadSchema } from './ApiKeyJwtPayloadSchema';
import { PersonalJwtPayloadSchema } from './PersonalJwtPayloadSchema';

export const JwtPayloadSchema = z.discriminatedUnion('tokenType', [
  ApiKeyJwtPayloadSchema,
  PersonalJwtPayloadSchema,
]);

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
