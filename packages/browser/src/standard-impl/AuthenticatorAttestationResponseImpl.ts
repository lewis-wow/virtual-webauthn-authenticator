import { BytesMapper } from '@repo/core/mappers';
import { COSEKeyParam } from '@repo/keys/cose/enums';
import {
  AuthenticatorDataParser,
  type IAttestationObjectMap,
} from '@repo/virtual-authenticator/cbor';
import * as cbor from 'cbor2';

import { AlgorithmIdentifierNotFoundInCoseKey } from '../exceptions/AlgorithmIdentifierNotFoundInCoseKey';
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
  private _attestationObjectMap?: IAttestationObjectMap;
  private _publicKey?: ArrayBuffer | null;
  private _publicKeyAlgorithm?: COSEAlgorithmIdentifier;

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
    if (this._publicKey !== undefined) {
      return this._publicKey;
    }

    // Get authData as Uint8Array for parsing
    const authData = BytesMapper.arrayBufferToBytes(
      this.getAuthenticatorData(),
    );

    const authenticatorDataParser = new AuthenticatorDataParser(authData);
    const publicKey = authenticatorDataParser.getPublicKey();
    if (publicKey === null) {
      this._publicKey = null;
      return null;
    }

    const rawKeyBytes = cbor.encode(authenticatorDataParser.getPublicKey());
    this._publicKey = BytesMapper.bytesToArrayBuffer(rawKeyBytes);
    this._publicKeyAlgorithm = publicKey.get(COSEKeyParam.alg);
    return this._publicKey;
  }

  getPublicKeyAlgorithm(): COSEAlgorithmIdentifier {
    if (this._publicKeyAlgorithm === undefined) {
      this.getPublicKey(); // Triggers parsing
    }

    if (this._publicKeyAlgorithm === undefined) {
      throw new AlgorithmIdentifierNotFoundInCoseKey();
    }

    return this._publicKeyAlgorithm;
  }

  getTransports(): string[] {
    // NOTE: Not implemented.
    return [];
  }
}
