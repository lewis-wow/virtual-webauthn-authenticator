import z from 'zod';

import { BytesSchema } from '../BytesSchema';

export const BytesSchemaCodec = z
  .codec(z.base64url(), BytesSchema, {
    decode: (base64String) => z.util.base64urlToUint8Array(base64String),
    encode: (bytes) => z.util.uint8ArrayToBase64url(bytes),
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
