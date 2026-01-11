import type { Uint8Array_ } from '@repo/types';
import * as cbor from 'cbor2';

export const encode = (val: unknown): Uint8Array_ => {
  return cbor.encode(val) as Uint8Array_;
};
