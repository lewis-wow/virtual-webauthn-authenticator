import * as cbor from '@repo/cbor';
import type { COSEPublicKey } from '@repo/keys';
import type { Uint8Array_ } from '@repo/types';

/**
 * Parsed authenticator data structure.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
 */
export type ParsedAuthenticatorData = {
  rpIdHash: Uint8Array_;
  flagsBuf: Uint8Array_;
  flags: {
    /** User Presence (UP) - bit 0 */
    up: boolean;
    /** User Verified (UV) - bit 2 */
    uv: boolean;
    /** Backup Eligibility (BE) - bit 3 */
    be: boolean;
    /** Backup State (BS) - bit 4 */
    bs: boolean;
    /** Attested Credential Data Present (AT) - bit 6 */
    at: boolean;
    /** Extension Data Present (ED) - bit 7 */
    ed: boolean;
    /** Raw flags byte as integer */
    flagsInt: number;
  };
  counter: number;
  counterBuf: Uint8Array_;
  aaguid?: Uint8Array_;
  credentialID?: Uint8Array_;
  credentialPublicKey?: COSEPublicKey;
  extensionsData?: Record<string, unknown>;
  extensionsDataBuffer?: Uint8Array_;
};

/**
 * Parse authenticator data buffer.
 *
 * Authenticator data: [RPIDHash (32)] [Flags (1)] [Counter (4)] [Attested credential data (Variable length)] [Extensions (Variable length)]
 * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 */
export const parseAuthenticatorData = (
  authData: Uint8Array_,
): ParsedAuthenticatorData => {
  if (authData.byteLength < 37) {
    throw new Error(
      `Authenticator data was ${authData.byteLength} bytes, expected at least 37 bytes`,
    );
  }

  let pointer = 0;
  const dataView = new DataView(
    authData.buffer,
    authData.byteOffset,
    authData.byteLength,
  );

  // RPIDHash (32 bytes)
  const rpIdHash = authData.slice(pointer, (pointer += 32));

  // Flags (1 byte)
  const flagsBuf = authData.slice(pointer, (pointer += 1));
  const flagsInt = flagsBuf[0]!;

  // Bit positions: https://www.w3.org/TR/webauthn-2/#flags
  const flags = {
    up: !!(flagsInt & (1 << 0)), // User Presence
    uv: !!(flagsInt & (1 << 2)), // User Verified
    be: !!(flagsInt & (1 << 3)), // Backup Eligibility
    bs: !!(flagsInt & (1 << 4)), // Backup State
    at: !!(flagsInt & (1 << 6)), // Attested Credential Data Present
    ed: !!(flagsInt & (1 << 7)), // Extension Data Present
    flagsInt,
  };

  // Counter (4 bytes, Big-Endian)
  const counterBuf = authData.slice(pointer, pointer + 4);
  const counter = dataView.getUint32(pointer, false);
  pointer += 4;

  let aaguid: Uint8Array_ | undefined = undefined;
  let credentialID: Uint8Array_ | undefined = undefined;
  let credentialPublicKey: COSEPublicKey | undefined = undefined;

  if (flags.at) {
    // AAGUID (16 bytes)
    aaguid = authData.slice(pointer, (pointer += 16));

    // Credential ID Length (2 bytes, Big-Endian)
    const credIDLen = dataView.getUint16(pointer, false);
    pointer += 2;

    // Credential ID (credIDLen bytes)
    credentialID = authData.slice(pointer, (pointer += credIDLen));

    // Credential Public Key (CBOR encoded)
    // Use decodeSequence to handle cases where extensions follow
    const remaining = authData.slice(pointer);
    const items = Array.from(cbor.decodeSequence<COSEPublicKey>(remaining));
    if (items.length === 0) {
      throw new Error('Expected public key in CBOR data');
    }
    credentialPublicKey = items[0]!;
    const firstEncoded = Uint8Array.from(cbor.encode(credentialPublicKey));
    pointer += firstEncoded.byteLength;
  }

  let extensionsData: Record<string, unknown> | undefined = undefined;
  let extensionsDataBuffer: Uint8Array_ | undefined = undefined;

  if (flags.ed) {
    type AuthenticatorExtensionData = Map<string, unknown>;
    const firstDecoded = cbor.decode<AuthenticatorExtensionData>(
      authData.slice(pointer),
    );
    extensionsDataBuffer = Uint8Array.from(cbor.encode(firstDecoded));

    // Convert Map to plain object
    if (firstDecoded instanceof Map) {
      const extensionsObj: Record<string, unknown> = {};
      for (const [key, value] of firstDecoded) {
        if (typeof key === 'string') {
          extensionsObj[key] = value;
        }
      }
      extensionsData = extensionsObj;
    } else if (typeof firstDecoded === 'object' && firstDecoded !== null) {
      extensionsData = firstDecoded as Record<string, unknown>;
    }

    pointer += extensionsDataBuffer.byteLength;
  }

  // Pointer should be at the end of the authenticator data
  if (authData.byteLength > pointer) {
    throw new Error('Leftover bytes detected while parsing authenticator data');
  }

  return {
    rpIdHash,
    flagsBuf,
    flags,
    counter,
    counterBuf,
    aaguid,
    credentialID,
    credentialPublicKey,
    extensionsData,
    extensionsDataBuffer,
  };
};
