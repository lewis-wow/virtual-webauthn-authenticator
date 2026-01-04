import { assertSchema } from '@repo/assert';
import type { ICOSEKeyMap } from '@repo/keys/cose/cbor';
import * as cbor from 'cbor2';
import z from 'zod';

export type ParsePayload = {
  /**
   * Bytes of rpId hash.
   */
  rpIdHash: Uint8Array;

  /**
   * Binary number - flags.
   */
  flags: number;

  /**
   * Big Endien number.
   */
  counter: number;

  aaguid: Uint8Array | null;

  /**
   * Big Endien number.
   */
  credentialIdLength: number | null;

  /**
   * Credential ID raw bytes
   */
  credentialId: Uint8Array | null;

  /**
   * COSE public key CBOR map
   */
  publicKey: ICOSEKeyMap | null;

  /**
   * Extensions CBOR decoded object.
   * Note: Extensions are decoded as plain objects, not Maps, since they use string keys.
   */
  extensions: Record<string, unknown> | null;
};

/**
 *
 * Authenticator data: [RPIDHash (32)] [Flags (1)] [Counter (4)] [Attested credential data (Variable length)] [Extensions (Variable length)]
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 */
export const parseAuthenticatorData = (authData: Uint8Array): ParsePayload => {
  assertSchema(
    authData,
    // [RPIDHash (32)] [Flags (1)] [Counter (4)] are required fields
    z.instanceof(Uint8Array).refine((value) => value.length >= 32 + 1 + 4),
  );

  // Pointer to track where we are in the buffer
  let pointer = 0;

  // RPIDHash
  // Length (in bytes): 32
  const rpIdHash = authData.slice(pointer, pointer + 32);
  assertSchema(
    rpIdHash,
    z.instanceof(Uint8Array).refine((value) => value.length === 32),
  );
  pointer += 32;

  // Flags
  // Length (in bytes): 1

  // Bit 0 (UP - User Present): Result of the user presence test
  // (1 = present, 0 = not present).
  // Bit 1 (RFU1): Reserved for future use.
  // Bit 2 (UV - User Verified): Result of the user verification test
  // (1 = verified, 0 = not verified).
  // Bits 3-5 (RFU2): Reserved for future use.
  // Bit 6 (AT - Attested Credential Data Included): Indicates if
  // attested credential data is included.
  // Bit 7 (ED - Extension data included): Indicates if extension data
  // is included in the authenticator data.

  const flags = authData[pointer]!;
  assertSchema(flags, z.number());
  pointer += 1;

  // Bit 6 (AT - Attested Credential Data Included): Indicates if
  // attested credential data is included.
  const attestationDataIncludedFlag = !!(flags & 0b01000000);

  // Bit 7 (ED - Extension data included): Indicates if extension data
  // is included in the authenticator data.
  const extensionsDataIncludedFlag = !!(flags & 0b10000000);

  // Counter
  // Length (in bytes): 4
  const counterBuffer = authData.slice(pointer, pointer + 4);
  assertSchema(counterBuffer, z.instanceof(Uint8Array));

  // Big-Endian number
  const counter = new DataView(
    counterBuffer.buffer,
    counterBuffer.byteOffset,
    counterBuffer.length,
  ).getUint32(0, false);

  assertSchema(counter, z.number());
  pointer += 4;

  let aaguid: Uint8Array | null = null;
  let credentialIdLength: number | null = null;
  let credentialId: Uint8Array | null = null;
  let publicKey: ICOSEKeyMap | null = null;
  let extensions: Record<string, unknown> | null = null;

  // Attested credential data: [AAGUID (16)] [Credential ID length (2)] [Credential ID (L)] [Credential public key (Variable length)]
  if (attestationDataIncludedFlag) {
    // AAGUID
    // Length (in bytes): 16
    aaguid = authData.slice(pointer, pointer + 16);
    assertSchema(
      aaguid,
      z.instanceof(Uint8Array).refine((value) => value.length === 16),
    );
    pointer += 16;

    // Credential ID length
    // Length (in bytes): 2
    const credentialIdLengthBuffer = authData.slice(pointer, pointer + 2);
    assertSchema(
      credentialIdLengthBuffer,
      z.instanceof(Uint8Array).refine((value) => value.length === 2),
    );

    // Big-Endian number
    credentialIdLength = new DataView(
      credentialIdLengthBuffer.buffer,
      credentialIdLengthBuffer.byteOffset,
      credentialIdLengthBuffer.length,
    ).getUint16(0, false);

    assertSchema(credentialIdLength, z.number());
    pointer += 2;

    // Credential ID
    // Length (in bytes): L
    credentialId = authData.slice(pointer, pointer + credentialIdLength);
    assertSchema(
      credentialId,
      z
        .instanceof(Uint8Array)
        .refine((value) => value.length === credentialIdLength),
    );
    pointer += credentialIdLength;

    // [Credential public key (Variable length)] - COSE Key (Variable Length CBOR)
  }

  if (attestationDataIncludedFlag || extensionsDataIncludedFlag) {
    // We slice from the current pointer to the end.
    // The decoder must be able to decode ONE item and ignore the rest (if extensions exist).

    // At this point, 'pointer' is at the start of the Public Key (if present),
    // or the start of Extensions (if present and no Key), or the end of the buffer.
    const remainingBuffer = authData.slice(pointer);

    // decodeSequence will read all consecutive CBOR items found in the buffer
    // Note: With saveOriginal: true, this decodes the CBOR and returns the parsed objects
    // NOTE: PreferMap should not be used, now the int keys objects are Maps, the string keys objects are records, which is correct.
    // COSE keys (number keys) become Maps, extensions (string keys) become plain objects

    const decodedItems = Array.from(
      cbor.decodeSequence<Map<number, unknown> | Record<string, unknown>>(
        remainingBuffer,
        {
          saveOriginal: true,
        },
      ),
    );

    let itemIndex = 0;
    if (attestationDataIncludedFlag) {
      if (itemIndex >= decodedItems.length) {
        throw new Error();
      }

      const publicKeyItem = decodedItems[itemIndex]! as ICOSEKeyMap;
      assertSchema(publicKeyItem, z.instanceof(Map));
      publicKey = publicKeyItem;
      itemIndex++;
    }

    if (extensionsDataIncludedFlag) {
      if (itemIndex >= decodedItems.length) {
        throw new Error();
      }

      const extensionsItem = decodedItems[itemIndex];
      assertSchema(extensionsItem, z.record(z.string(), z.unknown()));
      extensions = extensionsItem;
      itemIndex++;
    }
  }

  return {
    rpIdHash,
    flags,
    counter,
    aaguid,
    credentialIdLength,
    credentialId,
    publicKey,
    extensions,
  };
};
