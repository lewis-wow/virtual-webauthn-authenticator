import { assertSchema } from '@repo/assert';
import { Hash } from '@repo/crypto';
import type { Uint8Array_ } from '@repo/types';
import { toB64 } from '@repo/utils';
import z from 'zod';

import type { IAuthenticatorAgent } from './IAuthenticatorAgent';
import { PublicKeyCredentialCreationOptionsDtoSchema } from './dto/spec/PublicKeyCredentialCreationOptionsDtoSchema';
import { PublicKeyCredentialRequestOptionsDtoSchema } from './dto/spec/PublicKeyCredentialRequestOptionsDtoSchema';
import type {
  CredentialCreationOptions,
  PublicKeyCredential,
} from './validation';
import type { AuthenticatorAgentMetaArgs } from './validation/authenticator/AuthenticatorAgentMetaArgsSchema';
import type { AuthenticatorAgentContextArgs } from './validation/authenticatorAgent/AuthenticatorAgentContextArgsSchema';
import type { CredentialRequestOptions } from './validation/spec/CredentialRequestOptionsSchema';

export type VirtualAuthenticatorAgentEnvelopeOptions = {
  authenticatorAgent: IAuthenticatorAgent;
};

export class VirtualAuthenticatorAgentEnvelope {
  private readonly authenticatorAgent: IAuthenticatorAgent;

  constructor(opts: VirtualAuthenticatorAgentEnvelopeOptions) {
    this.authenticatorAgent = opts.authenticatorAgent;
  }

  private _hashCreateCredentialOptions(opts: {
    origin: string;
    options: CredentialCreationOptions;
    sameOriginWithAncestors: boolean;

    // Internal options
    meta: AuthenticatorAgentMetaArgs;
  }): Uint8Array_ {
    const { origin, options, sameOriginWithAncestors, meta } = opts;

    const publicKeyCredentialCreationOptions =
      PublicKeyCredentialCreationOptionsDtoSchema.encode(options.publicKey!);

    return Hash.sha256(
      JSON.stringify({
        origin,
        options: { publicKey: publicKeyCredentialCreationOptions },
        sameOriginWithAncestors,
        meta,
      }),
    );
  }

  async createCredential(opts: {
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
  }): Promise<PublicKeyCredential> {
    // Context hash validation
    assertSchema(
      opts.context.optionsHash,
      z.literal(toB64(this._hashCreateCredentialOptions(opts))).optional(),
    );

    const publicKeyCredential =
      await this.authenticatorAgent.createCredential(opts);

    return publicKeyCredential;
  }

  private _hashGetAssertionOptions(opts: {
    origin: string;
    options: CredentialRequestOptions;
    sameOriginWithAncestors: boolean;

    // Internal options
    meta: AuthenticatorAgentMetaArgs;
  }): Uint8Array_ {
    const { origin, options, sameOriginWithAncestors, meta } = opts;

    const publicKeyCredentialRequestOptions =
      PublicKeyCredentialRequestOptionsDtoSchema.encode(options.publicKey!);

    return Hash.sha256(
      JSON.stringify({
        origin,
        options: { publicKey: publicKeyCredentialRequestOptions },
        sameOriginWithAncestors,
        meta,
      }),
    );
  }

  /**
   * Gets an existing credential (authentication ceremony).
   * This implements the agent/client-side steps of the WebAuthn getAssertion algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
   */
  async getAssertion(opts: {
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
  }): Promise<PublicKeyCredential> {
    // Context hash validation
    assertSchema(
      opts.context.optionsHash,
      z.literal(toB64(this._hashGetAssertionOptions(opts))).optional(),
    );

    const publicKeyCredential =
      await this.authenticatorAgent.getAssertion(opts);

    return publicKeyCredential;
  }
}
