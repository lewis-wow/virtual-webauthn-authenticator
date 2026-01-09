import type { Uint8Array_ } from '@repo/types';
import * as cbor from 'cbor2';

export const decodeSequence = <T>(bytes: Uint8Array_): T[] => {
  return Array.from(cbor.decodeSequence<T>(bytes, { preferMap: true }));
};
