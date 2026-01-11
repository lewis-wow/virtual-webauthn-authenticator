import { assertSchema } from '@repo/assert';
import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';
import z from 'zod';

export class UUIDMapper {
  static UUIDtoBytes(uuid: string): Uint8Array_ {
    assertSchema(uuid, z.uuid());

    return new Uint8Array(Buffer.from(uuid.replace(/-/g, ''), 'hex'));
  }

  static tryUUIDtoBytes(uuid: string): Uint8Array_ | null {
    try {
      return UUIDMapper.UUIDtoBytes(uuid);
    } catch {
      return null;
    }
  }

  static bytesToUUID(bytes: Uint8Array_) {
    assertSchema(
      bytes,
      z.instanceof(Uint8Array).refine((b) => b.length === 16, {
        message: 'UUID must be exactly 16 bytes',
      }),
    );

    const hex = Buffer.from(bytes).toString('hex');

    // Insert hyphens at the correct positions (8-4-4-4-12)
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  static tryBytesToUUID(bytes: Uint8Array_): string | null {
    try {
      return UUIDMapper.bytesToUUID(bytes);
    } catch {
      return null;
    }
  }
}
