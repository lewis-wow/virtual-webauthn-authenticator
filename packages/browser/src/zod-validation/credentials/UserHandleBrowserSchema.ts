import { BytesMapper } from '@repo/core/mappers';
import { UserHandleSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { ArrayBufferBrowserSchema } from '../ArrayBufferBrowserSchema';

export const UserHandleBrowserSchema = z.codec(
  ArrayBufferBrowserSchema.nullable(),
  UserHandleSchema,
  {
    decode: (value) =>
      value === null ? null : BytesMapper.arrayBufferToBytes(value),
    encode: (value) =>
      value === null ? null : BytesMapper.bytesToArrayBuffer(value),
  },
);
