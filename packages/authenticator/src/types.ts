import type { MaybePromise } from '@repo/types';

export type COSEAlgorithmIdentifier = number;
export type PublicKeyCredentialType = 'public-key';

/**
 * A string encoded in Base64URL format. This is the standard for transmitting
 * binary data in JSON within the WebAuthn ecosystem.
 */
export type Base64URLString = string;

/**
 * Describes the authenticator's transport mechanism. This indicates how the
 * authenticator communicates with the client (e.g., via USB, NFC, Bluetooth).
 */
export type AuthenticatorTransportFuture =
  | 'ble' // Bluetooth Low Energy
  | 'cable' // A FIDO cable protocol (e.g., a mobile device connected to a computer)
  | 'hybrid' // A combination of transports
  | 'internal' // Built-in to the client device (e.g., Touch ID, Windows Hello)
  | 'nfc' // Near Field Communication
  | 'smart-card' // Smart card
  | 'usb'; // Universal Serial Bus

/**
 * Defines whether an authenticator is part of the client's platform (`platform`)
 * or a separate, roaming device (`cross-platform`).
 */
export type AuthenticatorAttachment = 'platform' | 'cross-platform';

/**
 * Represents the parsed `clientDataJSON` data. This object contains contextual
 * information about the WebAuthn ceremony.
 */
export interface ICollectedClientData {
  /** The type of WebAuthn operation, either registration or authentication. */
  type: 'webauthn.create' | 'webauthn.get';
  /** The challenge that was sent from the server to prevent replay attacks. */
  challenge: Base64URLString;
  /** The origin (domain) where the WebAuthn operation was initiated. */
  origin: string;
  /** Indicates if the operation was cross-origin. */
  crossOrigin?: boolean;
  /**
   * Information about token binding, used to cryptographically bind the
   * authentication to the TLS connection. Often omitted.
   */
  tokenBinding?: {
    status: 'present' | 'supported';
    id?: string;
  };
}

/**
 * A generic dictionary representing the client extension results, which provide
 * additional, optional data from the WebAuthn ceremony.
 */
export interface IAuthenticationExtensionsClientOutputs {
  [key: string]: unknown;
}

/**
 * A base interface for all authenticator responses, containing the mandatory
 * `clientDataJSON`.
 */
export interface IAuthenticatorResponse {
  /** The raw binary client data, containing the challenge, origin, etc. */
  clientDataJSON: Buffer;
}

/**
 * The authenticator's response during a registration (`webauthn.create`) ceremony.
 * It contains the attestation object used to verify the new credential.
 */
export interface IAuthenticatorAttestationResponse
  extends IAuthenticatorResponse {
  /**
   * The raw binary attestation object, which includes the authenticator data
   * and an attestation statement to prove the authenticator's integrity.
   */
  attestationObject: Buffer;
}

/**
 * The authenticator's response during an authentication (`webauthn.get`) ceremony.
 * It contains the data needed to verify a user's identity.
 */
export interface IAuthenticatorAssertionResponse
  extends IAuthenticatorResponse {
  /** The raw binary authenticator data. */
  authenticatorData: Buffer;
  /** The cryptographic signature proving possession of the private key. */
  signature: Buffer;
  /** A handle to the user account, if provided by the authenticator. */
  userHandle: Buffer | null;
}

/**
 * Represents a complete `PublicKeyCredential` object on the server. This is the
 * primary data structure for holding a credential after it has been received and
 * parsed from the client, but before it is serialized for storage.
 */
export interface IPublicKeyCredential {
  /** The unique, Base64URL-encoded ID for this credential. */
  id: Base64URLString;
  /** The raw binary version of the credential ID. */
  rawId: Buffer;
  /** The authenticator's response, either for registration or authentication. */
  response: IAuthenticatorAttestationResponse | IAuthenticatorAssertionResponse;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
  /** The client extension results from the ceremony. */
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment: AuthenticatorAttachment | null;
  /** A method to retrieve the client extension results. */
  getClientExtensionResults(): IAuthenticationExtensionsClientOutputs;
  /** A method to convert the credential into a JSON-serializable format. */
  toJSON(): IRegistrationResponseJSON;
}

/**
 * A generic JSON representation of the `response` part of a PublicKeyCredential.
 * It includes all possible fields from both attestation and assertion responses.
 */
export interface IPublicKeyCredentialJSONResponse {
  /** A Base64URL-encoded string of the client data. */
  clientDataJSON: Base64URLString;
  /** A Base64URL-encoded string of the attestation object (for registration). */
  attestationObject?: Base64URLString;
  /** A Base64URL-encoded string of the authenticator data. */
  authenticatorData?: Base64URLString;
  /** A Base64URL-encoded string of the signature (for authentication). */
  signature?: Base64URLString;
  /** A Base64URL-encoded string of the user handle (for authentication). */
  userHandle?: Base64URLString;
}

/**
 * A specific JSON representation of an authenticator's response during a
 * **registration** ceremony, providing more detail than the generic response.
 */
export interface IAuthenticatorAttestationResponseJSON {
  /** A Base64URL-encoded string of the client data. */
  clientDataJSON: Base64URLString;
  /** A Base64URL-encoded string of the attestation object. */
  attestationObject?: Base64URLString;
  /** An optional, decoded Base64URL-encoded string of the authenticator data. */
  authenticatorData?: Base64URLString;
  /** The transports the authenticator is believed to support. */
  transports?: AuthenticatorTransportFuture[];
  /** The algorithm used for the public key. */
  publicKeyAlgorithm?: COSEAlgorithmIdentifier;
  /** A Base64URL-encoded string of the public key. */
  publicKey?: Base64URLString;
}

/**
 * The complete JSON representation of a credential after a successful **registration**.
 * This is often the object sent back to the client upon completion.
 */
export interface IRegistrationResponseJSON {
  /** The unique, Base64URL-encoded ID for this credential. */
  id: Base64URLString;
  /** A Base64URL-encoded string of the raw credential ID. */
  rawId: Base64URLString;
  /** The detailed JSON response from the authenticator for registration. */
  response: IAuthenticatorAttestationResponseJSON;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment: AuthenticatorAttachment | null;
  /** The client extension results from the ceremony. */
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
}

/**
 * A generic JSON-serializable representation of a `PublicKeyCredential`.
 * This interface is suitable for storing credentials in a database or for
 * general-purpose data transfer.
 */
export interface IPublicKeyCredentialJSON {
  /** The unique, Base64URL-encoded ID for this credential. */
  id: Base64URLString;
  /** A Base64URL-encoded string of the raw credential ID. */
  rawId: Base64URLString;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
  /** The client extension results from the ceremony. */
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment: AuthenticatorAttachment | null;
  /** The JSON representation of the authenticator's response. */
  response: IPublicKeyCredentialJSONResponse;
}

/**
 * An interface for an object that can generate a standard JSON Web Key (JWK)
 * representation of its public key.
 */
export interface IPublicJsonWebKeyFactory {
  getPublicJsonWebKey(): MaybePromise<JsonWebKey>;
}

/**
 * An interface for an object that can sign arbitrary data, such as a
 * server-side challenge.
 */
export interface ISigner {
  sign(data: Buffer): MaybePromise<Uint8Array>;
}
