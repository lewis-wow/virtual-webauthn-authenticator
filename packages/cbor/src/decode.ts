import type { Uint8Array_ } from '@repo/types';
import * as cbor from 'cbor2';

export const decode = <T>(bytes: Uint8Array_): T => {
  return cbor.decode<T>(bytes, { preferMap: true });
};
