import type { Uint8Array_ } from '@repo/types';
import stableStringify from 'fast-json-stable-stringify';
import * as crypto from 'node:crypto';

export class Hash {
  // A separator that won't appear in Hex or Base64
  private static readonly DELIMITER = ':';

  static sha256(data: crypto.BinaryLike): Uint8Array_ {
    const hash = crypto.createHash('sha256').update(data).digest();

    return new Uint8Array(hash);
  }

  static hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array_ {
    const hmac = crypto.createHmac('sha256', key).update(data).digest();

    return new Uint8Array(hmac);
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

  static initOnion(hash: string | undefined): string[] {
    if (hash === undefined) {
      return [];
    }

    return [hash];
  }

  static pushOnion(hash: string, hashes: string[]): string[] {
    return [hash, ...hashes];
  }

  static popOnion(
    hashes: string[] | undefined,
  ): [string | undefined, string[] | undefined] {
    if (hashes === undefined) {
      return [undefined, undefined];
    }

    const [first, ...rest] = hashes;
    return [first, rest];
  }
}
