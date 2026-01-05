import z from 'zod';

export const BytesSchema = z.custom<Uint8Array>(
  (val) => val instanceof Uint8Array,
  { message: 'Expected a Uint8Array' },
);
