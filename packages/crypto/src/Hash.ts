import type { Uint8Array_ } from '@repo/types';
import stableStringify from 'fast-json-stable-stringify';
import * as crypto from 'node:crypto';

export class Hash {
  static sha256(data: crypto.BinaryLike): Uint8Array_ {
    return new Uint8Array(crypto.createHash('sha256').update(data).digest());
  }

  static sha256JSON(json: object): Uint8Array_ {
    return Hash.sha256(stableStringify(json));
  }
}
