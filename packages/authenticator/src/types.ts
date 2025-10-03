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
  clientDataJSON: string;
  attestationObject?: string;
  authenticatorData?: string;
  signature?: string;
  userHandle?: string;
}

/**
 * This interface represents the JSON-serializable version of a PublicKeyCredential,
 * where all binary data has been encoded as base64url strings.
 */
export interface IPublicKeyCredentialJSON {
  id: string;
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
