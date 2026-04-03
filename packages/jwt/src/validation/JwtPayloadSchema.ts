import { TokenType } from '@repo/auth/enums';
import { PermissionSchema, UserSchema } from '@repo/auth/validation';
import z from 'zod';

import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';

export const JwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  userId: UserSchema.shape.id,
  name: UserSchema.shape.name,
  email: UserSchema.shape.email,
  image: UserSchema.shape.image,
  permissions: z.array(PermissionSchema),
}).and(
  z.discriminatedUnion('tokenType', [
    z.object({
      tokenType: z.literal(TokenType.USER),
      apiKeyId: z.null(),
    }),
    z.object({
      tokenType: z.literal(TokenType.API_KEY),
      apiKeyId: z.uuid(),
      metadata: z.object({
        createdWebAuthnPublicKeyCredentialCount: z.int().nonnegative(),
      }),
    }),
  ]),
);

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
