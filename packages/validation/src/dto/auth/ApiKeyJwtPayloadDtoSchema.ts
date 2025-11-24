import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { ApiKeyDtoSchema } from './ApiKeyDtoSchema';
import { JwtRegisteredClaimsDtoSchema } from './JwtRegisteredClaimsDtoSchema';
import { UserDtoSchema } from './UserDtoSchema';

export const ApiKeyJwtPayloadDtoSchema = JwtRegisteredClaimsDtoSchema.extend({
  apiKey: ApiKeyDtoSchema.pick({
    id: true,
    enabled: true,
    permissions: true,
    metadata: true,
  }),
  user: UserDtoSchema.pick({
    id: true,
    email: true,
    name: true,
  }),
  tokenType: z.literal(TokenType.API_KEY),
}).meta({
  ref: 'JwtPayload',
});
