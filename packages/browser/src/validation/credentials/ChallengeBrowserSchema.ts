import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { ArrayBufferBrowserSchema } from '../../../../validation/src/browser/common';
import { ChallengeSchema } from '../../models/credentials/ChallengeSchema';

export const ChallengeBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  ChallengeSchema,
  {
    decode: BytesTransformer.fromArrayBuffer,
    encode: BytesTransformer.toArrayBuffer,
  },
);
