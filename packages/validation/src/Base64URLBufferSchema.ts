import z from 'zod';

export const Base64URLBufferSchema = z.codec(
  z
    .base64url()
    .describe(
      'A Base64URL-encoded string, which will be decoded into a Buffer.',
    ),
  z.instanceof(Buffer),
  {
    decode: (value) => Buffer.from(value, 'base64url'),
    encode: (value) => value.toString('base64url'),
  },
);
