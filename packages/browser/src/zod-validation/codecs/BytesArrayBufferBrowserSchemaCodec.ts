import { BytesMapper } from '@repo/core/mappers';
import { BytesSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { ArrayBufferBrowserSchema } from '../ArrayBufferBrowserSchema';

export const BytesArrayBufferBrowserSchemaCodec = z.codec(
  ArrayBufferBrowserSchema,
  BytesSchema,
  {
    decode: BytesMapper.arrayBufferToBytes,
    encode: BytesMapper.bytesToArrayBuffer,
  },
);
