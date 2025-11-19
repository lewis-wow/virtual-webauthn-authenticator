import { Schema } from 'effect';

import { ApiKeyJwtPayloadSchema } from './ApiKeyJwtPayloadSchema';
import { PersonalJwtPayloadSchema } from './PersonalJwtPayloadSchema';

export const JwtPayloadSchema = Schema.Union(
  ApiKeyJwtPayloadSchema,
  PersonalJwtPayloadSchema,
);

export type JwtPayload = Schema.Schema.Type<typeof JwtPayloadSchema>;
