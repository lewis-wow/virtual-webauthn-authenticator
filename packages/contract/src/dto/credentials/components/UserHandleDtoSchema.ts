import { UserHandleSchema } from '@repo/virtual-authenticator/zod-validation';
import z from 'zod';

export const UserHandleDtoSchema = z.codec(z.base64url(), UserHandleSchema, {
  decode: (base64String) => z.util.base64urlToUint8Array(base64String),
  encode: (bytes) => z.util.uint8ArrayToBase64url(bytes),
});
