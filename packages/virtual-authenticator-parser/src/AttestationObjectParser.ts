import { assertSchema } from '@repo/assert';
import * as cbor from 'cbor2';
import z from 'zod';

/**
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 */
export class AttestationObjectParser {
  parse(attestationObject: Uint8Array) {
    const decodedAttestationObjectMap = cbor.decode<Map<string, unknown>>(
      attestationObject,
      {
        preferMap: true,
      },
    );

    // 1. Basic Schema Validation

    // Fmt
    const fmt = decodedAttestationObjectMap.get('fmt');
    assertSchema(fmt, z.string());

    // Attestation statement
    const attStmt = decodedAttestationObjectMap.get('attStmt');
    assertSchema(attStmt, z.instanceof(Map));

    // Authenticator data: [RPIDHash (32)] [Flags (1)] [Counter (4)] [Attested credential data (Variable length)] [Extensions (Variable length)]
    // @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
    const authData = decodedAttestationObjectMap.get('authData');
    assertSchema(
      authData,
      // [RPIDHash (32)] [Flags (1)] [Counter (4)] are required fields
      z.instanceof(Uint8Array).refine((value) => value.length >= 32 + 1 + 4),
    );

    // 3. Parse Fixed Headers
    // We use a pointer to track where we are in the buffer
    let pointer = 0;

    // [RPIDHash (32)]
    const rpIdHash = authData.slice(pointer, pointer + 32);
    assertSchema(
      rpIdHash,
      z.instanceof(Uint8Array).refine((value) => value.length === 32),
    );
    pointer += 32;

    // [Flags (1)]
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
    // Length (in bytes): 1

    // authData.slice(pointer, pointer + 1);
    const flags = authData[pointer]!;
    assertSchema(flags, z.number());
    pointer += 1;

    // [Counter (4)]
    const counterBuffer = authData.slice(pointer, pointer + 4);
    assertSchema(counterBuffer, z.instanceof(Uint8Array));
    // Note: Parsing counter to number usually requires a DataView
    // Big-Endian
    const counter = new DataView(
      counterBuffer.buffer,
      counterBuffer.byteOffset,
      counterBuffer.length,
    ).getUint32(0, false);
    assertSchema(counter, z.number());
    pointer += 4;

    // 4. Parse flags

    // Bit 6 (AT - Attested Credential Data Included): Indicates if
    // attested credential data is included.
    const attestationDataIncludedFlag = !!(flags & 0b00100000);

    // Bit 7 (ED - Extension data included): Indicates if extension data
    // is included in the authenticator data.
    const extensionsDataIncludedFlag = !!(flags & 0b01000000);

    // 5. Handle Variable Length Data

    let aaguid: Uint8Array | null = null;
    let credentialIdLength: number | null = null;
    let credentialId: Uint8Array | null = null;
    let publicKey: Uint8Array | null = null;
    let extensions: Uint8Array | null = null;

    // Attested credential data: [AAGUID (16)] [Credential ID length (2)] [Credential ID (L)] [Credential public key (Variable length)]
    if (attestationDataIncludedFlag) {
      // [AAGUID (16)]
      aaguid = authData.slice(pointer, pointer + 16);
      assertSchema(
        aaguid,
        z.instanceof(Uint8Array).refine((value) => value.length === 16),
      );
      pointer += 16;

      // [Credential ID length (2)]
      const credentialIdLengthBuffer = authData.slice(pointer, pointer + 2);
      assertSchema(
        credentialIdLengthBuffer,
        z.instanceof(Uint8Array).refine((value) => value.length === 2),
      );
      // Big-Endian
      credentialIdLength = new DataView(
        credentialIdLengthBuffer.buffer,
        credentialIdLengthBuffer.byteOffset,
        credentialIdLengthBuffer.length,
      ).getUint16(0, false);
      assertSchema(credentialIdLength, z.number());
      pointer += 2;

      // [Credential ID (L)]
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
      const decodedItems = Array.from(
        cbor.decodeSequence<Uint8Array>(remainingBuffer, {
          saveOriginal: true,
        }),
      );

      let itemIndex = 0;

      if (attestationDataIncludedFlag) {
        if (itemIndex >= decodedItems.length) {
          throw new Error();
        }

        publicKey = decodedItems[itemIndex]!;
        itemIndex++;
      }

      if (extensionsDataIncludedFlag) {
        if (itemIndex >= decodedItems.length) {
          throw new Error();
        }

        extensions = decodedItems[itemIndex]!;
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

      fmt,
      attStmt,
      authData,
    };
  }
}
