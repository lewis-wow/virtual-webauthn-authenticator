import { BytesTransformer } from '@repo/transformers';
import z from 'zod';

import { BytesSchema } from '../../../virtual-authenticator/src/validation/BytesSchema';
import { BufferSourceBrowserSchema } from './common';

export const BytesBufferSourceSchemaCodec = z.codec(
  BufferSourceBrowserSchema,
  BytesSchema,
  {
    decode: BytesTransformer.fromBufferSource,
    encode: BytesTransformer.toBufferSource,
  },
);
