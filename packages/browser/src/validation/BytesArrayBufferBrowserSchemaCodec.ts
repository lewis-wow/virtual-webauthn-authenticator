import { BytesMapper } from '@repo/core/mappers';
import z from 'zod';

import { BytesSchema } from '../../../virtual-authenticator/src/validation/BytesSchema';
import { ArrayBufferBrowserSchema } from './ArrayBufferBrowserSchema';

export const BytesArrayBufferBrowserSchemaCodec = z.codec(
  ArrayBufferBrowserSchema,
  BytesSchema,
  {
    decode: BytesMapper.arrayBufferToBytes,
    encode: BytesMapper.bytesToArrayBuffer,
  },
);
