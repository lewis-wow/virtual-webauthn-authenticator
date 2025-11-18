import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { ArrayBufferBrowserSchema } from '../../../../validation/src/browser/common';
import { UserHandleSchema } from '../../models/credentials/UserHandleSchema';

export const UserHandleBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  UserHandleSchema,
  {
    decode: BytesTransformer.fromArrayBuffer,
    encode: BytesTransformer.toArrayBuffer,
  },
);
