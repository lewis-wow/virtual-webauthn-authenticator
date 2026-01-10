import type { Uint8Array_ } from '@repo/types';
import stableStringify from 'fast-json-stable-stringify';
import type { BinaryToTextEncoding } from 'node:crypto';
import * as crypto from 'node:crypto';

export class Hash {
  static sha256(data: crypto.BinaryLike): Uint8Array_;
  static sha256(
    data: crypto.BinaryLike,
    encoding: BinaryToTextEncoding,
  ): string;
  static sha256(
    data: crypto.BinaryLike,
    encoding?: BinaryToTextEncoding,
  ): Uint8Array_ | string {
    const hash = crypto.createHash('sha256').update(data);

    if (encoding === undefined) {
      return new Uint8Array(hash.digest());
    }

    return hash.digest(encoding);
  }

  static sha256JSON(json: object): Uint8Array_;
  static sha256JSON(json: object, encoding: BinaryToTextEncoding): string;
  static sha256JSON(
    json: object,
    encoding?: BinaryToTextEncoding,
  ): Uint8Array_ | string {
    if (encoding === undefined) {
      return Hash.sha256(stableStringify(json));
    }

    return Hash.sha256(stableStringify(json), encoding);
  }
}
