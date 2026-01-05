import type { AuthenticatorAgentContextArgs } from './validation/AuthenticatorAgentContextArgsSchema';
import type { AuthenticatorAgentMetaArgs } from './validation/AuthenticatorAgentMetaArgsSchema';
import type { CredentialCreationOptions } from './validation/CredentialCreationOptionsSchema';
import type { CredentialRequestOptions } from './validation/CredentialRequestOptionsSchema';
import type { PublicKeyCredentialOrPublicKeyCredentialCandidateList } from './validation/PublicKeyCredentialOrPublicKeyCredentialCandidateListSchema';
import type { PublicKeyCredential } from './validation/PublicKeyCredentialSchema';

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
    // origin: This argument is the relevant settings object’s origin, as determined by the calling create() implementation.
    // NOTE: It must match the meta.origin value
    origin: string;
    // options: This argument is a CredentialCreationOptions object whose options.publicKey member
    // contains a PublicKeyCredentialCreationOptions object specifying the desired attributes of the to-be-created public key credential.
    options: CredentialCreationOptions;
    // sameOriginWithAncestors: This argument is a Boolean value which is true if and only if the caller’s environment settings object is same-origin with its ancestors.
    // It is false if caller is cross-origin.
    sameOriginWithAncestors: boolean;

    // Internal options
    meta: AuthenticatorAgentMetaArgs;
    context: AuthenticatorAgentContextArgs;
  }): Promise<PublicKeyCredential>;

  /**
   * Gets an existing credential (authentication ceremony).
   * This implements the agent/client-side steps of the WebAuthn getAssertion algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
   */
  getAssertion(opts: {
    // origin: This argument is the relevant settings object’s origin, as determined by the calling get() implementation, i.e., CredentialsContainer’s Request a Credential abstract operation.
    // NOTE: It must match the meta.origin value
    origin: string;
    // options: This argument is a CredentialRequestOptions object whose options.publicKey member
    // contains a PublicKeyCredentialRequestOptions object specifying the desired attributes of the public key credential to discover.
    options: CredentialRequestOptions;
    // sameOriginWithAncestors: This argument is a Boolean value which is true if and only if the caller’s environment settings object is same-origin with its ancestors.
    // It is false if caller is cross-origin.
    sameOriginWithAncestors: boolean;

    // Internal options
    meta: AuthenticatorAgentMetaArgs;
    context: AuthenticatorAgentContextArgs;
  }): Promise<PublicKeyCredentialOrPublicKeyCredentialCandidateList>;
}
