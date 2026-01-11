import type { Uint8Array_ } from '@repo/types';
import * as cbor from 'cbor2';

export const decodeFirst = <T>(bytes: Uint8Array_): T | undefined => {
  return cbor.decodeSequence<T>(bytes, { preferMap: true }).next().value;
};
