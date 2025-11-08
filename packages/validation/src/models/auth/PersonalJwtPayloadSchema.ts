import { TokenType } from '@repo/enums';
import { z } from 'zod';

import { UserSchemaCodec } from '../common/UserSchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';

export const PersonalJwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  user: UserSchemaCodec.pick({
    id: true,
    email: true,
    name: true,
  }),
  tokenType: z.literal(TokenType.PERSONAL),
}).meta({
  ref: 'JwtPayload',
});

export type PersonalJwtPayload = z.infer<typeof PersonalJwtPayloadSchema>;
