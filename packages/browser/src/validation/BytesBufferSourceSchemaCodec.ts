import { BytesMapper } from '@repo/core/mappers';
import z from 'zod';

import { BytesSchema } from '../../../virtual-authenticator/src/validation/BytesSchema';
import { BufferSourceBrowserSchema } from './BufferSourceBrowserSchema';

export const BytesBufferSourceSchemaCodec = z.codec(
  BufferSourceBrowserSchema,
  BytesSchema,
  {
    decode: BytesMapper.bufferSourceToBytes,
    encode: BytesMapper.bytesToBufferSource,
  },
);
