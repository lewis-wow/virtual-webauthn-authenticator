import z from 'zod';

import { BytesSchema } from '../models/common/BytesSchema';
import { BufferSourceBrowserSchema, decode } from './BufferSourceBrowserSchema';

export const BytesBufferSourceSchemaCodec = z.codec(
  BufferSourceBrowserSchema,
  BytesSchema,
  {
    decode,
    encode: (bytes) => bytes,
  },
);
