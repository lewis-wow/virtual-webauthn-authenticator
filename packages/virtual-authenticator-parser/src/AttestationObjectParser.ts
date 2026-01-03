import { assertSchema } from '@repo/assert';
import * as cbor from 'cbor2';
import z from 'zod';

import { AuthenticatorDataTooShort } from './exceptions/AuthenticatorDataTooShort';

export type DecodedAttestationObject = {
  authData: Uint8Array;
  fmt: string;
  attStmt: Record<string, unknown>;
};

export type AttestationObjectParserOptions = {
  attestationObject: Uint8Array;
};

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
    assertSchema(attStmt, z.record(z.string(), z.unknown()));

    // Authenticator data: [RPIDHash (32)] [Flags (1)] [Counter (4)] [Attested credential data (Variable length)] [Extensions (Variable length)]
    // @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
    const authData = decodedAttestationObjectMap.get('authData');
    assertSchema(authData, z.instanceof(Uint8Array));

    // 2. Validate Fixed Header Length
    // [RPIDHash (32)] [Flags (1)] [Counter (4)] are required fields
    if (authData.length < 32 + 1 + 4) {
      throw new AuthenticatorDataTooShort();
    }

    // 3. Parse Fixed Headers
    // We use a pointer to track where we are in the buffer
    let pointer = 0;

    // [RPIDHash (32)]
    const rpIdHash = authData.slice(pointer, pointer + 32);
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
    const flags = authData[pointer]!;
    pointer += 1;

    // [Counter (4)]
    const counterBuffer = authData.slice(pointer, pointer + 4);
    pointer += 4;

    // Note: Parsing counter to number usually requires a DataView
    // Big-Endian
    const counter = new DataView(
      counterBuffer.buffer,
      counterBuffer.byteOffset,
      counterBuffer.length,
    ).getUint32(0, false);

    // 4. Parse flags

    // Bit 6 (AT - Attested Credential Data Included): Indicates if
    // attested credential data is included.
    const attestationDataIncludedFlag = !!(flags & 0b00100000);

    // Bit 7 (ED - Extension data included): Indicates if extension data
    // is included in the authenticator data.
    const extensionsDataIncludedFlag = !!(flags & 0b01000000);

    // 5. Handle Variable Length Data

    let attestedCredentialData = null;
    let extensionsData = null;

    if (attestationDataIncludedFlag) {
      const result = this._parseAttestedCredentialData({
        authData,
        pointer,
      });

      pointer = result.newPointer;
      attestedCredentialData = result.attestedCredentialData;
    }

    if (extensionsDataIncludedFlag) {
      const result = this._parseExtensionsData({
        authData,
        pointer,
      });

      pointer = result.newPointer;
      extensionsData = result.extensionsData;
    }
  }

  private _parseAttestedCredentialData(opts: {
    authData: Uint8Array;
    pointer: number;
  }): { attestedCredentialData: unknown; newPointer: number } {
    const { authData, pointer } = opts;

    // Attested credential data: [AAGUID (16)] [L (2)] [Credential ID (L)] [Credential public key (Variable length)]

    return {
      attestedCredentialData: null,
      newPointer: pointer,
    };
  }

  private _parseExtensionsData(opts: {
    authData: Uint8Array;
    pointer: number;
  }): { extensionsData: unknown; newPointer: number } {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authData: _authData, pointer } = opts;

    // NOTE: Not implemented

    return {
      extensionsData: null,
      newPointer: pointer,
    };
  }
}
