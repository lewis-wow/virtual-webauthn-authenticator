import * as crypto from 'node:crypto';

export class Hash {
  static sha256(data: crypto.BinaryLike): Buffer {
    return crypto.createHash('sha256').update(data).digest();
  }
}
