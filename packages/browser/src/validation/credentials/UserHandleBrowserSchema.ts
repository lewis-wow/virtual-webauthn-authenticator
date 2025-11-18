import { BytesMapper } from '@repo/core/mappers';
import { UserHandleSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { ArrayBufferBrowserSchema } from '../ArrayBufferBrowserSchema';

export const UserHandleBrowserSchema = z.codec(
  ArrayBufferBrowserSchema,
  UserHandleSchema,
  {
    decode: BytesMapper.arrayBufferToBytes,
    encode: BytesMapper.bytesToArrayBuffer,
  },
);
