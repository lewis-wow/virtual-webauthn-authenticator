import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { ChallengeSchema } from '../../models/credentials/ChallengeSchema';
import { ArrayBufferBrowserSchema } from '../common';

export const ChallengeBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  ChallengeSchema,
  {
    decode: BytesTransformer.fromArrayBuffer,
    encode: BytesTransformer.toArrayBuffer,
  },
);
