import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';

export class EncodingMapper {
  static bytesToBase64url(bytes: Uint8Array_): string {
    return Buffer.from(bytes).toString('base64url');
  }

  static base64urlToBytes(base64url: string): Uint8Array_ {
    return new Uint8Array(Buffer.from(base64url, 'base64url'));
  }
}
