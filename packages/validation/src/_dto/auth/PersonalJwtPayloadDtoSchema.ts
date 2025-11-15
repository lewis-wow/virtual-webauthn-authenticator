import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { UserDtoSchema } from '../common/UserDtoSchema';
import { JwtRegisteredClaimsDtoSchema } from './JwtRegisteredClaimsDtoSchema';

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
