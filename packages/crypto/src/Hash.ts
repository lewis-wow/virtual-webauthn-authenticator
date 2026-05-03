import type { Uint8Array_ } from '@repo/types';
import stableStringify from 'fast-json-stable-stringify';
import * as crypto from 'node:crypto';

export class Hash {
  static sha256(data: crypto.BinaryLike): Uint8Array_ {
    const hash = crypto.createHash('sha256').update(data).digest();

    return new Uint8Array(hash);
  }

  static sha256Hex(data: crypto.BinaryLike): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static sha256JSON(json: object): Uint8Array_ {
    return Hash.sha256(stableStringify(json));
  }

  static sha256JSONHex(json: object): string {
    return Hash.sha256Hex(stableStringify(json));
  }
}
