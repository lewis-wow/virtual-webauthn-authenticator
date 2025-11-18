import { z } from 'zod';

import { TokenType } from '../enums/TokenType';
import { ApiKeySchema } from './ApiKeySchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';
import { UserSchema } from './UserSchema';

export const ApiKeyJwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  apiKey: ApiKeySchema.pick({
    id: true,
    enabled: true,
    permissions: true,
    metadata: true,
  }),
  user: UserSchema.pick({
    id: true,
    email: true,
    name: true,
  }),
  tokenType: z.literal(TokenType.API_KEY),
}).meta({
  ref: 'JwtPayload',
});

export type ApiKeyJwtPayload = z.infer<typeof ApiKeyJwtPayloadSchema>;
