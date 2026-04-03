import z from 'zod';

import { TokenType } from '../enums/TokenType';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';
import { UserSchema } from './UserSchema';
import { PermissionSchema } from './enums/PermissionSchema';

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
