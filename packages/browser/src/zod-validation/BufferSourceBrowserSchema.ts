import z from 'zod';

export const BufferSourceBrowserSchema = z.custom<BufferSource>(
  (data) => ArrayBuffer.isView(data) || data instanceof ArrayBuffer,
);
