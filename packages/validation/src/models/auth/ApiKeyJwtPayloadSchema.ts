import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { UserSchemaCodec } from '../common/UserSchema';
import { ApiKeySchemaCodec } from './ApiKeySchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';

export const ApiKeyJwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  apiKey: ApiKeySchemaCodec.pick({
    id: true,
    enabled: true,
    permissions: true,
    metadata: true,
  }),
  user: UserSchemaCodec.pick({
    id: true,
    email: true,
    name: true,
  }),
  tokenType: z.literal(TokenType.API_KEY),
}).meta({
  ref: 'JwtPayload',
});

export type ApiKeyJwtPayload = z.infer<typeof ApiKeyJwtPayloadSchema>;
