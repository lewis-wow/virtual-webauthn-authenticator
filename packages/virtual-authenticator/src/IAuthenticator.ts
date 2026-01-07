import type { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import type { IWebAuthnRepository } from './repositories';
import type { AuthenticatorAgentContextArgs } from './validation/AuthenticatorAgentContextArgsSchema';
import type { AuthenticatorGetAssertionArgs } from './validation/AuthenticatorGetAssertionArgsSchema';
import type { AuthenticatorGetAssertionResponse } from './validation/AuthenticatorGetAssertionResponseSchema';
import type { AuthenticatorMakeCredentialArgs } from './validation/AuthenticatorMakeCredentialArgsSchema';
import type { AuthenticatorMakeCredentialResponse } from './validation/AuthenticatorMakeCredentialResponseSchema';
import type { PublicKeyCredentialCandidate } from './validation/PublicKeyCredentialCandidateSchema';

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
   * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorMakeCredential
   */
  authenticatorMakeCredential(opts: {
    authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
    context: AuthenticatorAgentContextArgs;
    meta: AuthenticatorMetaArgs;
  }): Promise<AuthenticatorMakeCredentialResponse>;

  /**
   * The authenticatorGetAssertion operation.
   * This is the authenticator-side operation for generating an assertion.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorGetAssertion
   */
  authenticatorGetAssertion(opts: {
    authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
    context: AuthenticatorAgentContextArgs;
    meta: AuthenticatorMetaArgs;
  }): Promise<
    AuthenticatorGetAssertionResponse | PublicKeyCredentialCandidate[]
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
