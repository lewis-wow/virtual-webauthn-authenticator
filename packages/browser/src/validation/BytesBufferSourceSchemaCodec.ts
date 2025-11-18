import z from 'zod';

import { BytesSchema } from '../../../virtual-authenticator/src/validation/BytesSchema';
import { BytesMapper } from '../mappers/BytesMapper';
import { BufferSourceBrowserSchema } from './BufferSourceBrowserSchema';

export const BytesBufferSourceSchemaCodec = z.codec(
  BufferSourceBrowserSchema,
  BytesSchema,
  {
    decode: BytesMapper.fromBufferSource,
    encode: BytesMapper.toBufferSource,
  },
);
