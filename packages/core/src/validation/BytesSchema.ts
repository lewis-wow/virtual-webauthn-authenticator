import type { Uint8Array_ } from '@repo/types';
import z from 'zod';

export const BytesSchema = z.custom<Uint8Array_>(
  (val) => val instanceof Uint8Array,
  { message: 'Expected a Uint8Array' },
);
