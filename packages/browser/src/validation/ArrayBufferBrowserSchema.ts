import z from 'zod';

export const ArrayBufferBrowserSchema = z.custom<ArrayBuffer>(
  (data) => data instanceof ArrayBuffer,
);
