import z from 'zod';

import { BytesSchema } from '../../../virtual-authenticator/src/validation/BytesSchema';
import { BytesMapper } from '../mappers/BytesMapper';
import { ArrayBufferBrowserSchema } from './ArrayBufferBrowserSchema';

export const BytesArrayBufferBrowserSchemaCodec = z.codec(
  ArrayBufferBrowserSchema,
  BytesSchema,
  {
    decode: BytesMapper.fromArrayBuffer,
    encode: BytesMapper.toArrayBuffer,
  },
);
