import z from 'zod';

import { ChallengeSchema } from '../validation/spec/ChallengeSchema';

export const ChallengeDtoSchema = z.codec(z.base64url(), ChallengeSchema, {
  decode: (base64String) => z.util.base64urlToUint8Array(base64String),
  encode: (bytes) => z.util.uint8ArrayToBase64url(bytes),
});
