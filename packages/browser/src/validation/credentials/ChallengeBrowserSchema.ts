import { ChallengeSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { BytesMapper } from '../../mappers/BytesMapper';
import { ArrayBufferBrowserSchema } from '../ArrayBufferBrowserSchema';

export const ChallengeBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  ChallengeSchema,
  {
    decode: BytesMapper.fromArrayBuffer,
    encode: BytesMapper.toArrayBuffer,
  },
);
