import z from 'zod';

export const Base64urlToBytesSchema = z
  .codec(z.base64(), z.instanceof(Uint8Array), {
    decode: (base64String) => z.util.base64ToUint8Array(base64String),
    encode: (bytes) => z.util.uint8ArrayToBase64(bytes),
  })
  .meta({
    ref: 'Base64URL',
    description:
      'A Base64URL-encoded string, which will be decoded into a Uint8Array.',
    examples: ['aGVsbG8gd29ybGQ'],
    override: {
      type: 'string',
    },
  });
