import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { UserSchema } from '../common/UserSchema';
import { ApiKeySchema } from './ApiKeySchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';

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
