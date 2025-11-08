import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { ApiKeySchema } from './ApiKeySchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';

export const ApiKeyJwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  apiKey: ApiKeySchema,
  tokenType: z.literal(TokenType.API_KEY),
}).meta({
  ref: 'JwtPayload',
});

export type ApiKeyJwtPayload = z.infer<typeof ApiKeyJwtPayloadSchema>;
