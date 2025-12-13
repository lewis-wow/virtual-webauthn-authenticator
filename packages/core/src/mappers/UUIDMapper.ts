import { assertSchema } from '@repo/utils';
import { Buffer } from 'buffer';
import z from 'zod';

export class UUIDMapper {
  static UUIDtoBytes(uuid: string): Uint8Array {
    assertSchema(uuid, z.uuid());

    return new Uint8Array(Buffer.from(uuid.replace(/-/g, ''), 'hex'));
  }

  static bytesToUUID(bytes: Uint8Array) {
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
}
