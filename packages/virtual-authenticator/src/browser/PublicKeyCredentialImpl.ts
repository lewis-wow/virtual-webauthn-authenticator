import { BytesMapper } from '@repo/core/mappers';
import type {
  AuthenticationExtensionsClientOutputs,
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
  PublicKeyCredential,
} from '@repo/types/dom';
import { Buffer } from 'buffer';

import { PublicKeyCredentialType } from '../enums';

export type PublicKeyCredentialImplOptions = {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
  authenticatorAttachment: string | null;
  clientExtensionResults: Record<string, unknown>;
};

export class PublicKeyCredentialImpl implements PublicKeyCredential {
  public readonly id: string;
  public readonly rawId: ArrayBuffer;
  public readonly type: typeof PublicKeyCredentialType.PUBLIC_KEY;
  public readonly response:
    | AuthenticatorAttestationResponse
    | AuthenticatorAssertionResponse;
  public readonly authenticatorAttachment: string | null;
  public readonly clientExtensionResults: Record<string, unknown>;

  constructor(opts: PublicKeyCredentialImplOptions) {
    this.id = opts.id;
    this.rawId = opts.rawId;
    this.type = PublicKeyCredentialType.PUBLIC_KEY;
    this.response = opts.response;
    this.authenticatorAttachment = opts.authenticatorAttachment;
    this.clientExtensionResults = opts.clientExtensionResults;
  }

  /**
   * Converts the PublicKeyCredential to a JSON-serializable object.
   * This follows the WebAuthn Level 2 specification for credential serialization.
   *
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredential-tojson
   */
  toJSON(): PublicKeyCredentialJSON {
    const rawIdBytes = BytesMapper.arrayBufferToBytes(this.rawId);
    const rawIdBase64url = Buffer.from(rawIdBytes).toString('base64url');

    // Check if this is an attestation (registration) or assertion (authentication) response
    if ('attestationObject' in this.response) {
      // Registration response
      const attestationResponse = this
        .response as AuthenticatorAttestationResponse;

      const clientDataJSONBytes = BytesMapper.arrayBufferToBytes(
        attestationResponse.clientDataJSON,
      );
      const attestationObjectBytes = BytesMapper.arrayBufferToBytes(
        attestationResponse.attestationObject,
      );

      return {
        id: this.id,
        rawId: rawIdBase64url,
        type: this.type,
        authenticatorAttachment: this.authenticatorAttachment,
        response: {
          clientDataJSON:
            Buffer.from(clientDataJSONBytes).toString('base64url'),
          attestationObject: Buffer.from(attestationObjectBytes).toString(
            'base64url',
          ),
          transports: attestationResponse.getTransports(),
        },
        clientExtensionResults: this.getClientExtensionResults(),
      };
    } else {
      // Authentication response
      const assertionResponse = this.response as AuthenticatorAssertionResponse;

      const clientDataJSONBytes = BytesMapper.arrayBufferToBytes(
        assertionResponse.clientDataJSON,
      );
      const authenticatorDataBytes = BytesMapper.arrayBufferToBytes(
        assertionResponse.authenticatorData,
      );
      const signatureBytes = BytesMapper.arrayBufferToBytes(
        assertionResponse.signature,
      );
      const userHandleBytes = assertionResponse.userHandle
        ? BytesMapper.arrayBufferToBytes(assertionResponse.userHandle)
        : null;

      return {
        id: this.id,
        rawId: rawIdBase64url,
        type: this.type,
        authenticatorAttachment: this.authenticatorAttachment,
        response: {
          clientDataJSON:
            Buffer.from(clientDataJSONBytes).toString('base64url'),
          authenticatorData: Buffer.from(authenticatorDataBytes).toString(
            'base64url',
          ),
          signature: Buffer.from(signatureBytes).toString('base64url'),
          userHandle: userHandleBytes
            ? Buffer.from(userHandleBytes).toString('base64url')
            : undefined,
        },
        clientExtensionResults: this.getClientExtensionResults(),
      };
    }
  }

  getClientExtensionResults(): AuthenticationExtensionsClientOutputs {
    return this.clientExtensionResults;
  }
}

/**
 * Type definition for the JSON representation of a PublicKeyCredential
 */
export interface PublicKeyCredentialJSON {
  id: string;
  rawId: string;
  type: typeof PublicKeyCredentialType.PUBLIC_KEY;
  authenticatorAttachment: string | null;
  response: {
    clientDataJSON: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string;
    transports?: string[];
  };
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
}
