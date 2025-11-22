import { JwtPayloadSchema } from '@repo/auth/validation';
import { Schema } from 'effect';

export const GetProfileResponseSchema = Schema.Struct({
  jwtPayload: Schema.NullOr(JwtPayloadSchema),
}).annotations({
  identifier: 'GetProfileResponse',
});
