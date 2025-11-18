import { TokenType } from '@repo/auth/enums';
import { z } from 'zod';

import { JwtRegisteredClaimsDtoSchema } from './JwtRegisteredClaimsDtoSchema';
import { UserDtoSchema } from './UserDtoSchema';

export const PersonalJwtPayloadDtoSchema = JwtRegisteredClaimsDtoSchema.extend({
  user: UserDtoSchema.pick({
    id: true,
    email: true,
    name: true,
  }),
  tokenType: z.literal(TokenType.PERSONAL),
}).meta({
  ref: 'JwtPayload',
});
