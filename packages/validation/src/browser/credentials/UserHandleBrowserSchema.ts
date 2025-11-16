import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { UserHandleSchema } from '../../models/credentials/UserHandleSchema';
import { ArrayBufferBrowserSchema } from '../common';

export const UserHandleBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  UserHandleSchema,
  {
    decode: BytesTransformer.fromArrayBuffer,
    encode: BytesTransformer.toArrayBuffer,
  },
);
