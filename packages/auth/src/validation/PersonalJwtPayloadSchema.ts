import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';
import { UserSchema } from './UserSchema';

export const PersonalJwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  user: UserSchema.pick({
    id: true,
    email: true,
    name: true,
  }),
  tokenType: z.literal(TokenType.PERSONAL),
}).meta({
  ref: 'JwtPayload',
});

export type PersonalJwtPayload = z.infer<typeof PersonalJwtPayloadSchema>;
