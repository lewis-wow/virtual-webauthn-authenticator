import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { BytesSchema } from '../models/common/BytesSchema';
import { ArrayBufferBrowserSchema } from './common';

export const BytesArrayBufferBrowserSchemaCodec = z.codec(
  ArrayBufferBrowserSchema,
  BytesSchema,
  {
    decode: BytesTransformer.fromArrayBuffer,
    encode: BytesTransformer.toArrayBuffer,
  },
);
