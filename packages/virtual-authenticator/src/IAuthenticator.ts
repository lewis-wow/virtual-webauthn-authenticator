import type { IWebAuthnRepository } from './repositories';
import type { AuthenticatorAgentContextArgs } from './validation/AuthenticatorAgentContextArgsSchema';
import type { AuthenticatorGetAssertionArgs } from './validation/AuthenticatorGetAssertionArgsSchema';
import type { AuthenticatorMakeCredentialArgs } from './validation/AuthenticatorMakeCredentialArgsSchema';
import type { AuthenticatorMetaArgs } from './validation/AuthenticatorMetaArgsSchema';
import type { VirtualAuthenticatorGetAssertionResponse } from './validation/VirtualAuthenticatorGetAssertionResponseSchema';
import type { VirtualAuthenticatorMakeCredentialResponse } from './validation/VirtualAuthenticatorMakeCredentialResponseSchema';

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
  }): Promise<VirtualAuthenticatorMakeCredentialResponse>;

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
  }): Promise<VirtualAuthenticatorGetAssertionResponse>;

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
}
