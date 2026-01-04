import { BytesMapper } from '@repo/core/mappers';
import type { COSEKeyMap } from '@repo/keys/cose';
import type { IAttestationObjectMap } from '@repo/virtual-authenticator/cbor';
import * as cbor from 'cbor2';

import { AlgorithmIdentifierNotFoundInCoseKey } from '../exceptions/AlgorithmIdentifierNotFoundInCoseKey';
import { AuthenticatorDataTooShort } from '../exceptions/AuthenticatorDataTooShort';
import { FailedToParseCosePublicKey } from '../exceptions/FailedToParseCosePublicKey';
import {
  AuthenticatorResponseImpl,
  type AuthenticatorResponseImplOptions,
} from './AuthenticatorResponseImpl';

export type DecodedAttestationObject = {
  authData: Uint8Array;
  fmt: string;
  attStmt: Record<string, unknown>;
};

export type AuthenticatorAttestationResponseImplOptions =
  AuthenticatorResponseImplOptions & {
    attestationObject: ArrayBuffer;
  };

export class AuthenticatorAttestationResponseImpl
  extends AuthenticatorResponseImpl
  implements AuthenticatorAttestationResponse
{
  public readonly attestationObject: ArrayBuffer;

  // Caches to prevent repeated expensive parsing
  private _attestationObjectMap: IAttestationObjectMap | null = null;

  private _publicKey: ArrayBuffer | null = null;
  private _publicKeyAlgo: COSEAlgorithmIdentifier | undefined;

  constructor(opts: AuthenticatorAttestationResponseImplOptions) {
    super({ clientDataJSON: opts.clientDataJSON });

    this.attestationObject = opts.attestationObject;
  }

  /**
   * Decodes the CBOR attestationObject and extracts the binary authData.
   */
  getAuthenticatorData(): ArrayBuffer {
    if (this._attestationObjectMap?.has('authData')) {
      return BytesMapper.bytesToArrayBuffer(
        this._attestationObjectMap.get('authData')!,
      );
    }

    // 1. Decode the top-level CBOR map
    // Use BytesMapper to ensure we have a clean Uint8Array for the CBOR decoder
    const attestationBytes = BytesMapper.arrayBufferToBytes(
      this.attestationObject,
    );

    this._attestationObjectMap = cbor.decode<IAttestationObjectMap>(
      attestationBytes,
      {
        preferMap: true,
      },
    );

    // Normalize to Uint8Array using Mapper, then store the underlying ArrayBuffer
    return BytesMapper.bytesToArrayBuffer(
      this._attestationObjectMap.get('authData')!,
    );
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
      // cbor.decode will decode exactly one CBOR item (the key map)
      // Use preferMap: false to get a plain object for easier access
      const coseKeyDecoded = cbor.decode(remainingBytes, {
        preferMap: false,
      });

      let coseKeyMap: COSEKeyMap;

      // Handle both Map and object formats
      if (coseKeyDecoded instanceof Map) {
        // Convert Map to object for consistent handling
        coseKeyMap = Object.fromEntries(coseKeyDecoded) as COSEKeyMap;
        this._publicKeyAlgo = coseKeyDecoded.get(3) as number | undefined;
      } else {
        coseKeyMap = coseKeyDecoded as COSEKeyMap;
        // Extract the Algorithm (Key "3" is "alg")
        // COSEKeyMap is a Map, so we need to use .get()
        this._publicKeyAlgo = (coseKeyMap as Map<number, unknown>).get(3) as
          | number
          | undefined;
      }

      // Re-encode to get the exact raw bytes of the key map
      // cbor.encode returns a Buffer
      const rawKeyBytes = cbor.encode(coseKeyMap);

      // Normalize to ArrayBuffer using Mapper
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
