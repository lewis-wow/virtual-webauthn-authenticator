import * as crypto from 'node:crypto';

export class Hash {
  static sha256(data: crypto.BinaryLike): Uint8Array {
    return new Uint8Array(crypto.createHash('sha256').update(data).digest());
  }
}
