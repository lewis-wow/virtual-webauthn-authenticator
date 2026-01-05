import type { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import type { IWebAuthnRepository } from './repositories';
import type { AuthenticatorAgentContextArgs } from './validation/AuthenticatorAgentContextArgsSchema';
import type { AuthenticatorGetAssertionArgs } from './validation/AuthenticatorGetAssertionArgsSchema';
import type { AuthenticatorMakeCredentialArgs } from './validation/AuthenticatorMakeCredentialArgsSchema';
import type { PublicKeyCredentialCandidate } from './validation/PublicKeyCredentialCandidateSchema';

/**
 * Payload returned by the authenticatorMakeCredential operation.
 * Contains the newly created credential ID and attestation object.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
 */
export type AuthenticatorMakeCredentialPayload = {
  /** The credential ID of the newly created credential */
  credentialId: Uint8Array;
  /**
   * The attestation object containing the authenticator data and
   * attestation statement
   */
  attestationObject: Uint8Array;
};

/**
 * Payload returned by the authenticatorGetAssertion operation.
 * Contains the assertion data needed to verify the authentication.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
 */
export type AuthenticatorGetAssertionPayload = {
  /** The credential ID used to create this assertion */
  credentialId: Uint8Array;
  /**
   * The authenticator data, including RP ID hash, flags, and
   * signature counter
   */
  authenticatorData: Uint8Array;
  /** The assertion signature over the authenticator data and client data */
  signature: Uint8Array;
  /** The user handle associated with this credential */
  userHandle: Uint8Array;
};

/**
 * Metadata for a discoverable credential used in silent credential
 * discovery.
 *
 * Discoverable credentials (also known as resident credentials or
 * passkeys) are stored credentials that can be discovered without
 * requiring the relying party to provide a credential ID list.
 * This metadata is used during the silent credential discovery process
 * to identify matching credentials for a given relying party.
 * @see https://www.w3.org/TR/webauthn-3/#silentcredentialdiscovery
 */
export type DiscoverableCredentialMetadata = {
  /** The type of the credential, typically "public-key" */
  type: PublicKeyCredentialType;
  /** The unique identifier for this credential */
  credentialId: Uint8Array;
  /** The relying party identifier that this credential is scoped to */
  rpId: string;
  /** The user handle (user ID) associated with this credential */
  userHandle: Uint8Array;
};

export type AuthenticatorMetaArgs = {
  userId: string;
};

/**
 * Interface defining the authenticator operations as specified in the
 * Web Authentication Level 3 specification.
 *
 * An authenticator is a cryptographic entity that can generate key pairs
 * and create assertions. This interface defines the three core operations
 * that authenticators must support: creating credentials, generating
 * assertions, and canceling operations.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-ops
 */
export interface IAuthenticator {
  readonly webAuthnRepository: IWebAuthnRepository;

  /**
   * The authenticatorMakeCredential operation.
   * This is the authenticator-side operation for creating a new credential.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
   */
  authenticatorMakeCredential(opts: {
    authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
    context: AuthenticatorAgentContextArgs;
    meta: AuthenticatorMetaArgs;
  }): Promise<AuthenticatorMakeCredentialPayload>;

  /**
   * The authenticatorGetAssertion operation.
   * This is the authenticator-side operation for generating an assertion.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   */
  authenticatorGetAssertion(opts: {
    authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
    context: AuthenticatorAgentContextArgs;
    meta: AuthenticatorMetaArgs;
  }): Promise<
    AuthenticatorGetAssertionPayload | PublicKeyCredentialCandidate[]
  >;

  /**
   * The authenticatorCancel operation.
   * When this operation is invoked by the client in an authenticator
   * session, it has the effect of terminating any authenticatorMakeCredential
   * or authenticatorGetAssertion operation currently in progress in that
   * authenticator session. The authenticator stops prompting for, or
   * accepting, any user input related to authorizing the canceled operation.
   * The client ignores any further responses from the authenticator for the
   * canceled operation.
   *
   * This operation is ignored if it is invoked in an authenticator session
   * which does not have an authenticatorMakeCredential or
   * authenticatorGetAssertion operation currently in progress.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-cancel
   */
  authenticatorCancel(opts: { meta: AuthenticatorMetaArgs }): Promise<void>;

  /**
   * The authenticatorSilentCredentialDiscovery operation.
   * This is an optional operation authenticators may support to enable
   * conditional user mediation (conditional UI).
   *
   * When invoked with a relying party ID, this operation silently
   * discovers and returns metadata for all discoverable credentials
   * stored by the authenticator that are scoped to the given RP ID.
   * This allows the user agent to present available credentials in
   * autofill UI without requiring user interaction with the
   * authenticator.
   *
   * The operation returns an array of credential metadata, which
   * includes the credential ID, type, RP ID, and user handle for each
   * matching discoverable credential. The operation must not involve
   * any user interaction or verification.
   * @see https://www.w3.org/TR/webauthn-3/#silentcredentialdiscovery
   */
  authenticatorSilentCredentialDiscovery?(opts: {
    rpId: string;
    meta: AuthenticatorMetaArgs;
  }): Promise<DiscoverableCredentialMetadata[]>;
}
