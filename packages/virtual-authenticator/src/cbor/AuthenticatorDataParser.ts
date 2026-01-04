import { assertSchema } from '@repo/assert';
import type { ICOSEKeyMap } from '@repo/keys/cose/cbor';
import * as cbor from 'cbor2';
import z from 'zod';

/**
 * A class for parsing authenticator data on-the-fly using getters.
 * Does not pre-parse the entire authData buffer, but parses each field lazily when requested.
 *
 * Authenticator data: [RPIDHash (32)] [Flags (1)] [Counter (4)] [Attested credential data (Variable length)] [Extensions (Variable length)]
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 */
export class AuthenticatorDataParser {
  private authData: Uint8Array;

  // Cache for parsed values to avoid re-parsing
  private _rpIdHash?: Uint8Array;
  private _flags?: number;
  private _counter?: number;
  private _aaguid?: Uint8Array | null;
  private _credentialIdLength?: number | null;
  private _credentialId?: Uint8Array | null;
  private _publicKey?: ICOSEKeyMap | null;
  private _extensions?: Record<string, unknown> | null;

  constructor(authData: Uint8Array) {
    assertSchema(
      authData,
      // [RPIDHash (32)] [Flags (1)] [Counter (4)] are required fields
      z.instanceof(Uint8Array).refine((value) => value.length >= 32 + 1 + 4),
    );
    this.authData = authData;
  }

  /**
   * Get RPIDHash (32 bytes)
   */
  getRpIdHash(): Uint8Array {
    if (this._rpIdHash !== undefined) {
      return this._rpIdHash;
    }

    const rpIdHash = this.authData.slice(0, 32);
    assertSchema(
      rpIdHash,
      z.instanceof(Uint8Array).refine((value) => value.length === 32),
    );
    this._rpIdHash = rpIdHash;
    return rpIdHash;
  }

  /**
   * Get Flags (1 byte)
   *
   * Bit 0 (UP - User Present): Result of the user presence test
   * Bit 1 (RFU1): Reserved for future use.
   * Bit 2 (UV - User Verified): Result of the user verification test
   * Bits 3-5 (RFU2): Reserved for future use.
   * Bit 6 (AT - Attested Credential Data Included): Indicates if attested credential data is included.
   * Bit 7 (ED - Extension data included): Indicates if extension data is included in the authenticator data.
   */
  getFlags(): number {
    if (this._flags !== undefined) {
      return this._flags;
    }

    const flags = this.authData[32]!;
    assertSchema(flags, z.number());
    this._flags = flags;
    return flags;
  }

  /**
   * Get Counter (4 bytes, Big-Endian)
   */
  getCounter(): number {
    if (this._counter !== undefined) {
      return this._counter;
    }

    const counterBuffer = this.authData.slice(32 + 1, 32 + 1 + 4);
    assertSchema(counterBuffer, z.instanceof(Uint8Array));

    // Big-Endian number
    const counter = new DataView(
      counterBuffer.buffer,
      counterBuffer.byteOffset,
      counterBuffer.length,
    ).getUint32(0, false);

    assertSchema(counter, z.number());
    this._counter = counter;
    return counter;
  }

  /**
   * Check if attestation data is included (AT flag, bit 6)
   */
  private hasAttestationData(): boolean {
    const flags = this.getFlags();
    return !!(flags & 0b01000000);
  }

  /**
   * Check if extensions data is included (ED flag, bit 7)
   */
  private hasExtensionsData(): boolean {
    const flags = this.getFlags();
    return !!(flags & 0b10000000);
  }

  /**
   * Get AAGUID (16 bytes) if attestation data is included, otherwise null
   */
  getAaguid(): Uint8Array | null {
    if (this._aaguid !== undefined) {
      return this._aaguid;
    }

    if (!this.hasAttestationData()) {
      this._aaguid = null;
      return null;
    }

    const pointer = 32 + 1 + 4; // After rpIdHash, flags, counter
    const aaguid = this.authData.slice(pointer, pointer + 16);
    assertSchema(
      aaguid,
      z.instanceof(Uint8Array).refine((value) => value.length === 16),
    );
    this._aaguid = aaguid;
    return aaguid;
  }

  /**
   * Get Credential ID Length (2 bytes, Big-Endian) if attestation data is included, otherwise null
   */
  getCredentialIdLength(): number | null {
    if (this._credentialIdLength !== undefined) {
      return this._credentialIdLength;
    }

    if (!this.hasAttestationData()) {
      this._credentialIdLength = null;
      return null;
    }

    const pointer = 32 + 1 + 4 + 16; // After rpIdHash, flags, counter, aaguid
    const credentialIdLengthBuffer = this.authData.slice(pointer, pointer + 2);
    assertSchema(
      credentialIdLengthBuffer,
      z.instanceof(Uint8Array).refine((value) => value.length === 2),
    );

    // Big-Endian number
    const credentialIdLength = new DataView(
      credentialIdLengthBuffer.buffer,
      credentialIdLengthBuffer.byteOffset,
      credentialIdLengthBuffer.length,
    ).getUint16(0, false);

    assertSchema(credentialIdLength, z.number());
    this._credentialIdLength = credentialIdLength;
    return credentialIdLength;
  }

  /**
   * Get Credential ID (L bytes) if attestation data is included, otherwise null
   */
  getCredentialId(): Uint8Array | null {
    if (this._credentialId !== undefined) {
      return this._credentialId;
    }

    if (!this.hasAttestationData()) {
      this._credentialId = null;
      return null;
    }

    const credentialIdLength = this.getCredentialIdLength();
    if (credentialIdLength === null) {
      this._credentialId = null;
      return null;
    }

    const pointer = 32 + 1 + 4 + 16 + 2; // After rpIdHash, flags, counter, aaguid, credentialIdLength
    const credentialId = this.authData.slice(
      pointer,
      pointer + credentialIdLength,
    );
    assertSchema(
      credentialId,
      z
        .instanceof(Uint8Array)
        .refine((value) => value.length === credentialIdLength),
    );
    this._credentialId = credentialId;
    return credentialId;
  }

  /**
   * Parse CBOR items from the remaining buffer (public key and/or extensions)
   */
  private parseCborItems(): void {
    // Only parse once
    if (this._publicKey !== undefined || this._extensions !== undefined) {
      return;
    }

    // Initialize as null
    this._publicKey = null;
    this._extensions = null;

    if (!this.hasAttestationData() && !this.hasExtensionsData()) {
      return;
    }

    let pointer = 32 + 1 + 4; // After rpIdHash, flags, counter

    if (this.hasAttestationData()) {
      const credentialIdLength = this.getCredentialIdLength();
      if (credentialIdLength !== null) {
        pointer += 16 + 2 + credentialIdLength; // Add aaguid, credentialIdLength, credentialId
      }
    }

    const remainingBuffer = this.authData.slice(pointer);

    const decodedItems = Array.from(
      cbor.decodeSequence<Map<number, unknown> | Record<string, unknown>>(
        remainingBuffer,
        {
          saveOriginal: true,
        },
      ),
    );

    let itemIndex = 0;
    if (this.hasAttestationData()) {
      if (itemIndex >= decodedItems.length) {
        throw new Error('Expected public key in CBOR data');
      }

      const publicKeyItem = decodedItems[itemIndex]! as ICOSEKeyMap;
      assertSchema(publicKeyItem, z.instanceof(Map));
      this._publicKey = publicKeyItem;
      itemIndex++;
    }

    if (this.hasExtensionsData()) {
      if (itemIndex >= decodedItems.length) {
        throw new Error('Expected extensions in CBOR data');
      }

      const extensionsItem = decodedItems[itemIndex];
      assertSchema(extensionsItem, z.record(z.string(), z.unknown()));
      this._extensions = extensionsItem;
      itemIndex++;
    }
  }

  /**
   * Get Public Key (COSE Key CBOR Map) if attestation data is included, otherwise null
   */
  getPublicKey(): ICOSEKeyMap | null {
    if (this._publicKey !== undefined) {
      return this._publicKey;
    }

    this.parseCborItems();
    return this._publicKey ?? null;
  }

  /**
   * Get Extensions (CBOR decoded object) if extensions data is included, otherwise null
   */
  getExtensions(): Record<string, unknown> | null {
    if (this._extensions !== undefined) {
      return this._extensions;
    }

    this.parseCborItems();
    return this._extensions ?? null;
  }
}
