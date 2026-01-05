import { BytesMapper } from '@repo/core/mappers';
import { ChallengeSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { ArrayBufferBrowserSchema } from '../ArrayBufferBrowserSchema';

export const ChallengeBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  ChallengeSchema,
  {
    decode: BytesMapper.arrayBufferToBytes,
    encode: BytesMapper.bytesToArrayBuffer,
  },
);
