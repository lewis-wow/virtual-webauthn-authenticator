import type { IWebAuthnRepository } from './repositories/IWebAuthnRepository';
import type { AuthenticatorContextArgs } from './validation/authenticator/AuthenticatorContextArgsSchema';
import type { AuthenticatorGetAssertionArgs } from './validation/authenticator/AuthenticatorGetAssertionArgsSchema';
import type { AuthenticatorGetAssertionResponse } from './validation/authenticator/AuthenticatorGetAssertionResponseSchema';
import type { AuthenticatorMakeCredentialArgs } from './validation/authenticator/AuthenticatorMakeCredentialArgsSchema';
import type { AuthenticatorMakeCredentialResponse } from './validation/authenticator/AuthenticatorMakeCredentialResponseSchema';
import type { AuthenticatorMetaArgs } from './validation/authenticator/AuthenticatorMetaArgsSchema';

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
    context: AuthenticatorContextArgs;
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
    context: AuthenticatorContextArgs;
    meta: AuthenticatorMetaArgs;
  }): Promise<AuthenticatorGetAssertionResponse>;

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
