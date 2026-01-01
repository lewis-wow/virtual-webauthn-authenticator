import { UserHandleSchema } from '@repo/virtual-authenticator/zod-validation';
import z from 'zod';

export const UserHandleDtoSchema = z.codec(
  z.base64url().nullable(),
  UserHandleSchema,
  {
    decode: (base64String) =>
      base64String === null ? null : z.util.base64urlToUint8Array(base64String),
    encode: (bytes) =>
      bytes === null ? null : z.util.uint8ArrayToBase64url(bytes),
  },
);
