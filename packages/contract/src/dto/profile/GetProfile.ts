import { HttpStatusCode } from '@repo/http';
import { JwtPayloadSchema } from '@repo/jwt/validation';
import z from 'zod';

export const GetProfileResponseSchema = {
  [HttpStatusCode.OK_200]: z.object({
    jwtPayload: JwtPayloadSchema.nullable(),
  }),
};
