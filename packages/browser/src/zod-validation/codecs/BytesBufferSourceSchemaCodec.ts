import { BytesMapper } from '@repo/core/mappers';
import { BytesSchema } from '@repo/virtual-authenticator/zod-validation';
import z from 'zod';

import { BufferSourceBrowserSchema } from '../BufferSourceBrowserSchema';

export const BytesBufferSourceSchemaCodec = z.codec(
  BufferSourceBrowserSchema,
  BytesSchema,
  {
    decode: BytesMapper.bufferSourceToBytes,
    encode: BytesMapper.bytesToBufferSource,
  },
);
