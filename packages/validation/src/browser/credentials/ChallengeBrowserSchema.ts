import z from 'zod';

import { ChallengeSchema } from '../../models/credentials/ChallengeSchema';
import {
  BufferSourceBrowserSchema,
  decode,
} from '../BufferSourceBrowserSchema';

export const ChallengeBrowserSchema = z.codec(
  BufferSourceBrowserSchema,
  ChallengeSchema,
  {
    decode,
    encode: (bytes) => bytes,
  },
);
