import type { MaybePromise } from '@repo/types';

/**
 * Defines the possible values for authenticator attachment.
 */
export type AuthenticatorAttachment = 'platform' | 'cross-platform';

/**
 * Represents the client extension results.
 */
export interface IAuthenticationExtensionsClientOutputs {
  [key: string]: unknown;
}

/**
 * Base interface for authenticator responses.
 */
export interface IAuthenticatorResponse {
  clientDataJSON: Buffer;
}

/**
 * Represents the authenticator's response during a registration ceremony.
 */
export interface IAuthenticatorAttestationResponse
  extends IAuthenticatorResponse {
  attestationObject: Buffer;
}

/**
 * Represents the authenticator's response during an authentication ceremony.
 */
export interface IAuthenticatorAssertionResponse
  extends IAuthenticatorResponse {
  authenticatorData: Buffer;
  signature: Buffer;
  userHandle: Buffer | null;
}

/**
 * This interface represents the structure of a PublicKeyCredential
 * as it exists on the server, using Buffers for binary data.
 */
export interface IPublicKeyCredential {
  /**
   * Base64 URL
   */
  id: string;
  rawId: Buffer;
  response: IAuthenticatorAttestationResponse | IAuthenticatorAssertionResponse;
  type: 'public-key';
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  authenticatorAttachment: AuthenticatorAttachment | null;
  getClientExtensionResults(): IAuthenticationExtensionsClientOutputs;
  toJSON(): unknown;
}

export interface IPublicKeyCredentialJSONResponse {
  /**
   * Base64 URL
   */
  clientDataJSON: string;
  /**
   * Base64 URL
   */
  attestationObject?: string;
  /**
   * Base64 URL
   */
  authenticatorData?: string;
  /**
   * Base64 URL
   */
  signature?: string;
  /**
   * Base64 URL
   */
  userHandle?: string;
}

/**
 * This interface represents the JSON-serializable version of a PublicKeyCredential,
 * where all binary data has been encoded as base64url strings.
 */
export interface IPublicKeyCredentialJSON {
  /**
   * Base64 URL
   */
  id: string;
  /**
   * Base64 URL
   */
  rawId: string;
  type: 'public-key';
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  authenticatorAttachment: AuthenticatorAttachment | null;
  response: IPublicKeyCredentialJSONResponse;
}

export interface IPublicJsonWebKeyFactory {
  getPublicJsonWebKey(): MaybePromise<JsonWebKey>;
}

export interface ISigner {
  sign(data: Buffer): MaybePromise<Uint8Array>;
}

export interface ICollectedClientData {
  type: 'webauthn.create' | 'webauthn.get';
  /**
   * Base64 URL
   */
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
  // tokenBinding is an optional property from the spec, often omitted.
  tokenBinding?: {
    status: 'present' | 'supported';
    id?: string;
  };
}
