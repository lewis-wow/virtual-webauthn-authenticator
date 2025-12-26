import type { AuthenticatorAgentContextArgs } from './zod-validation/AuthenticatorAgentContextArgsSchema';
import type { AuthenticatorAgentMetaArgs } from './zod-validation/AuthenticatorAgentMetaArgsSchema';
import type { CredentialCreationOptions } from './zod-validation/CredentialCreationOptionsSchema';
import type { CredentialRequestOptions } from './zod-validation/CredentialRequestOptionsSchema';
import type { PublicKeyCredential } from './zod-validation/PublicKeyCredentialSchema';

/**
 * Virtual WebAuthn Agent (Client) implementation.
 * This class implements the client/browser-side logic of WebAuthn ceremonies.
 * It coordinates with the VirtualAuthenticator for authenticator operations.
 */
export interface IAuthenticatorAgent {
  /**
   * Creates a new public key credential (registration ceremony).
   * This implements the agent/client-side steps of the WebAuthn createCredential algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   */
  createCredential(opts: {
    credentialCreationOptions: CredentialCreationOptions;
    meta: AuthenticatorAgentMetaArgs;
    context: AuthenticatorAgentContextArgs;
  }): Promise<PublicKeyCredential>;

  /**
   * Gets an existing credential (authentication ceremony).
   * This implements the agent/client-side steps of the WebAuthn getAssertion algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
   */
  getAssertion(opts: {
    credentialRequestOptions: CredentialRequestOptions;
    meta: AuthenticatorAgentMetaArgs;
    context: AuthenticatorAgentContextArgs;
  }): Promise<PublicKeyCredential>;
}
