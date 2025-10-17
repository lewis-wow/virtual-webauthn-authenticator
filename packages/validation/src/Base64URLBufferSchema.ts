import z from 'zod';

export const Base64URLBufferSchema = z
  .codec(z.base64url(), z.instanceof(Buffer), {
    decode: (value) => Buffer.from(value, 'base64url'),
    encode: (value) => value.toString('base64url'),
  })
  .meta({
    id: 'Base64URL',
    description:
      'A Base64URL-encoded string, which will be decoded into a Buffer.',
    examples: ['aGVsbG8gd29ybGQ'],
    override: {
      type: 'string',
    },
  });
