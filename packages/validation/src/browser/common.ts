import type { BufferSource } from 'node:stream/web';
import z from 'zod';

export const ArrayBufferBrowserSchema = z.custom<ArrayBuffer>(
  (data) => data instanceof ArrayBuffer,
);

export const ArrayBufferViewBrowserSchema = z.custom<ArrayBufferView>((data) =>
  ArrayBuffer.isView(data),
);

export const BufferSourceBrowserSchema = z.custom<BufferSource>(
  (data) => ArrayBuffer.isView(data) || data instanceof ArrayBuffer,
);
