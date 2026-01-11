import { BytesMapper } from '@repo/core/mappers';
import { encodeCOSEPublicKey } from '@repo/keys/cbor';
import { COSEKeyParam } from '@repo/keys/enums';
import type { Uint8Array_ } from '@repo/types';
import type {
  AuthenticatorAttestationResponse,
  COSEAlgorithmIdentifier,
} from '@repo/types/dom';

import type { AttestationObjectMap } from '../cbor/AttestationObjectMap';
import { decodeAttestationObject } from '../cbor/decodeAttestationObject';
import { parseAuthenticatorData } from '../cbor/parseAuthenticatorData';
import type { AuthenticatorTransport } from '../enums';
import { AlgorithmIdentifierNotFoundInCoseKey } from '../exceptions';
import {
  AuthenticatorResponseImpl,
  type AuthenticatorResponseImplOptions,
} from './AuthenticatorResponseImpl';
import { bytesToArrayBuffer } from './helpers/bytesConversion';

export type DecodedAttestationObject = {
  authData: Uint8Array_;
  fmt: string;
  attStmt: Record<string, unknown>;
};

export type AuthenticatorAttestationResponseImplOptions =
  AuthenticatorResponseImplOptions & {
    attestationObject: Uint8Array_;
    transports: AuthenticatorTransport[];
  };

export class AuthenticatorAttestationResponseImpl
  extends AuthenticatorResponseImpl
  implements AuthenticatorAttestationResponse
{
  public readonly attestationObject: ArrayBuffer;
  public readonly transports: AuthenticatorTransport[];

  // Caches to prevent repeated expensive parsing
  private _attestationObjectMap?: AttestationObjectMap;
  private _publicKey?: ArrayBuffer | null;
  private _publicKeyAlgorithm?: COSEAlgorithmIdentifier;

  constructor(opts: AuthenticatorAttestationResponseImplOptions) {
    super({ clientDataJSON: opts.clientDataJSON });

    this.attestationObject = bytesToArrayBuffer(opts.attestationObject);
    this.transports = opts.transports;
  }

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

    this._attestationObjectMap = decodeAttestationObject(attestationBytes);

    // Normalize to Uint8Array using Mapper, then store the underlying ArrayBuffer
    return BytesMapper.bytesToArrayBuffer(
      this._attestationObjectMap.get('authData')!,
    );
  }

  getPublicKey(): ArrayBuffer | null {
    if (this._publicKey !== undefined) {
      return this._publicKey;
    }

    // Get authData as Uint8Array for parsing
    const authData = BytesMapper.arrayBufferToBytes(
      this.getAuthenticatorData(),
    );

    const parsedAuthenticatorData = parseAuthenticatorData(authData);
    const publicKey = parsedAuthenticatorData.credentialPublicKey;
    if (publicKey === undefined) {
      this._publicKey = null;
      return null;
    }

    const rawKeyBytes = encodeCOSEPublicKey(publicKey);
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
    return this.transports;
  }
}
