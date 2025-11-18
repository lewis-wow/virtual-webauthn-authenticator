import { UserHandleSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { BytesMapper } from '../../mappers/BytesMapper';
import { ArrayBufferBrowserSchema } from '../ArrayBufferBrowserSchema';

export const UserHandleBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  UserHandleSchema,
  {
    decode: BytesMapper.fromArrayBuffer,
    encode: BytesMapper.toArrayBuffer,
  },
);
