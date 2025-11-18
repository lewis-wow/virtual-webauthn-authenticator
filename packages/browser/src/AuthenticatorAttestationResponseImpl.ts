import { BytesMapper } from '@repo/core/mappers';
import * as cbor from 'cbor-x';

import { AuthenticatorResponseImpl } from './AuthenticatorResponseImpl';
import { AlgorithmIdentifierNotFoundInCoseKey } from './exceptions/AlgorithmIdentifierNotFoundInCoseKey';
import { AttestationObjectMissingAuthData } from './exceptions/AttestationObjectMissingAuthData';
import { AuthenticatorDataTooShort } from './exceptions/AuthenticatorDataTooShort';
import { FailedToDecodeAttestationObject } from './exceptions/FailedToDecodeAttestationObject';
import { FailedToParseCosePublicKey } from './exceptions/FailedToParseCosePublicKey';

export type DecodedAttestationObject = {
  authData: Uint8Array;
  fmt: string;
  attStmt: Record<string, unknown>;
};

export class AuthenticatorAttestationResponseImpl
  extends AuthenticatorResponseImpl
  implements AuthenticatorAttestationResponse
{
  readonly attestationObject: ArrayBuffer;

  // Caches to prevent repeated expensive parsing
  private _decodedAttestationObject: DecodedAttestationObject | null = null;
  private _authenticatorData: ArrayBuffer | null = null;
  private _publicKey: ArrayBuffer | null = null;
  private _publicKeyAlgo: COSEAlgorithmIdentifier | undefined;

  constructor(attestationObject: ArrayBuffer, clientDataJSON: ArrayBuffer) {
    super(clientDataJSON);
    this.attestationObject = attestationObject;
  }

  /**
   * Decodes the CBOR attestationObject and extracts the binary authData.
   */
  getAuthenticatorData(): ArrayBuffer {
    if (this._authenticatorData) {
      return this._authenticatorData;
    }

    // 1. Decode the top-level CBOR map
    // Use BytesMapper to ensure we have a clean Uint8Array for the CBOR decoder
    const attestationBytes = BytesMapper.arrayBufferToBytes(
      this.attestationObject,
    );

    try {
      // cbor.decodeFirstSync accepts Uint8Array
      this._decodedAttestationObject = cbor.decode(attestationBytes);
    } catch (e) {
      throw new FailedToDecodeAttestationObject({
        cause: e,
      });
    }

    // 2. Extract authData
    // cbor usually returns Node Buffers for binary fields.
    // We treat it as a generic BufferSource.
    const authDataBytes = this._decodedAttestationObject!.authData;

    if (!authDataBytes) {
      throw new AttestationObjectMissingAuthData();
    }

    // Normalize to Uint8Array using Mapper, then store the underlying ArrayBuffer
    this._authenticatorData = BytesMapper.bytesToArrayBuffer(authDataBytes);

    return this._authenticatorData!;
  }

  /**
   * Parses the binary authData to extract the COSE Public Key.
   */
  getPublicKey(): ArrayBuffer | null {
    if (this._publicKey) return this._publicKey;

    // Get authData as Uint8Array for parsing
    const authData = BytesMapper.arrayBufferToBytes(
      this.getAuthenticatorData(),
    );
    const view = new DataView(
      authData.buffer,
      authData.byteOffset,
      authData.byteLength,
    );

    // --- Binary Parsing of Authenticator Data ---

    // 1. Read Flags (Byte 32)
    // Layout: [RPIDHash (32)] [Flags (1)] [SignCount (4)] ...
    if (authData.length < 37) {
      throw new AuthenticatorDataTooShort();
    }

    const flags = authData[32]!;
    const attestationDataIncluded = !!(flags & 0x40); // Bit 6

    if (!attestationDataIncluded) {
      return null;
    }

    // 2. Calculate Offset to Credential Data
    // 32 (RPID) + 1 (Flags) + 4 (Count) = 37 bytes
    let offset = 37;

    // 3. Skip AAGUID (16 bytes)
    offset += 16;

    // 4. Read Credential ID Length (2 bytes, Big-Endian)
    if (view.byteLength < offset + 2) return null;
    const credIdLen = view.getUint16(offset, false);
    offset += 2;

    // 5. Skip Credential ID
    offset += credIdLen;

    // 6. Extract COSE Public Key
    // The key starts at 'offset'. It is a CBOR map.
    const remainingBytes = authData.subarray(offset);

    try {
      // decodeFirstSync will decode exactly one CBOR item (the key map)
      const coseKeyMap = cbor.decode(remainingBytes);

      // Extract the Algorithm (Key "3" is "alg")
      if (coseKeyMap instanceof Map) {
        this._publicKeyAlgo = coseKeyMap.get(3);
      } else {
        this._publicKeyAlgo = coseKeyMap[3];
      }

      // Re-encode to get the exact raw bytes of the key map
      // cbor.encode returns a Node Buffer
      const rawKeyBuffer = cbor.encode(coseKeyMap);

      // Normalize to ArrayBuffer using Mapper
      const rawKeyBytes = BytesMapper.bufferSourceToBytes(rawKeyBuffer);
      this._publicKey = BytesMapper.bytesToArrayBuffer(rawKeyBytes);
    } catch (e) {
      throw new FailedToParseCosePublicKey({
        cause: e,
      });
    }

    return this._publicKey;
  }

  getPublicKeyAlgorithm(): COSEAlgorithmIdentifier {
    if (this._publicKeyAlgo === undefined) {
      this.getPublicKey(); // Triggers parsing
    }

    if (this._publicKeyAlgo === undefined) {
      throw new AlgorithmIdentifierNotFoundInCoseKey();
    }

    return this._publicKeyAlgo;
  }

  getTransports(): string[] {
    return [];
  }
}
