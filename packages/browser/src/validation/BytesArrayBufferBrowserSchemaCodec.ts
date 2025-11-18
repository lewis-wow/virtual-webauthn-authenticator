import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { BytesSchema } from '../../../virtual-authenticator/src/validation/BytesSchema';
import { ArrayBufferBrowserSchema } from './common';

export const BytesArrayBufferBrowserSchemaCodec = z.codec(
  ArrayBufferBrowserSchema,
  BytesSchema,
  {
    decode: BytesTransformer.fromArrayBuffer,
    encode: BytesTransformer.toArrayBuffer,
  },
);
