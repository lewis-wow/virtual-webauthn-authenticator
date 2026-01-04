import { ChallengeSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

export const ChallengeDtoSchema = z.codec(z.base64url(), ChallengeSchema, {
  decode: (base64String) => z.util.base64urlToUint8Array(base64String),
  encode: (bytes) => z.util.uint8ArrayToBase64url(bytes),
});
