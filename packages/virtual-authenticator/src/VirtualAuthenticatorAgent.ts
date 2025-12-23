import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { assertSchema } from '@repo/utils';
import z from 'zod';

import type { VirtualAuthenticator } from './VirtualAuthenticator';
import {
  Attestation,
  Fmt,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from './enums';
import { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import { AttestationNotSupported } from './exceptions/AttestationNotSupported';
import { CredentialTypesNotSupported } from './exceptions/CredentialTypesNotSupported';
import { UserVerificationNotAvailable } from './exceptions/UserVerificationNotAvailable';
import type { CollectedClientData } from './zod-validation/CollectedClientDataSchema';
import {
  CredentialCreationOptionsSchema,
  type CredentialCreationOptions,
} from './zod-validation/CredentialCreationOptionsSchema';
import type { CredentialRequestOptions } from './zod-validation/CredentialRequestOptionsSchema';
import { PublicKeyCredentialCreationOptionsSchema } from './zod-validation/PublicKeyCredentialCreationOptionsSchema';
import { PublicKeyCredentialRequestOptionsSchema } from './zod-validation/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredential } from './zod-validation/PublicKeyCredentialSchema';
import {
  VirtualAuthenticatorCredentialContextArgsSchema,
  type VirtualAuthenticatorCredentialContextArgs,
} from './zod-validation/VirtualAuthenticatorCredentialContextArgsSchema';
import {
  VirtualAuthenticatorCredentialMetaArgsSchema,
  type VirtualAuthenticatorCredentialMetaArgs,
} from './zod-validation/VirtualAuthenticatorCredentialMetaArgsSchema';
import { createOriginMatchesRpIdSchema } from './zod-validation/createOriginMatchesRpIdSchema';

export type VirtualAuthenticatorAgentOptions = {
  authenticator: VirtualAuthenticator;
};

/**
 * Virtual WebAuthn Agent (Client) implementation.
 * This class implements the client/browser-side logic of WebAuthn ceremonies.
 * It coordinates with the VirtualAuthenticator for authenticator operations.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
 */
export class VirtualAuthenticatorAgent {
  private readonly authenticator: VirtualAuthenticator;

  constructor(opts: VirtualAuthenticatorAgentOptions) {
    this.authenticator = opts.authenticator;
  }

  /**
   * Creates a new public key credential (registration ceremony).
   * This implements the agent/client-side steps of the WebAuthn createCredential algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   */
  public async createCredential(opts: {
    credentialCreationOptions: CredentialCreationOptions;
    meta: VirtualAuthenticatorCredentialMetaArgs;
    context: VirtualAuthenticatorCredentialContextArgs;
  }): Promise<PublicKeyCredential> {
    const { credentialCreationOptions, meta, context } = opts;

    // Step 1: Assert options.publicKey is present
    assertSchema(
      credentialCreationOptions,
      CredentialCreationOptionsSchema.safeExtend({
        publicKey: PublicKeyCredentialCreationOptionsSchema,
      }),
    );

    const publicKeyCredentialCreationOptions =
      credentialCreationOptions.publicKey;

    console.log('KOCKA', meta.userId);

    assertSchema(
      meta,
      VirtualAuthenticatorCredentialMetaArgsSchema.safeExtend({
        userId: z.literal(
          UUIDMapper.bytesToUUID(publicKeyCredentialCreationOptions.user.id),
        ),
      }),
    );

    console.log('PES');

    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

    // Step 5: Validate user.id length is between 1 and 64 bytes (handled by schema validation)

    // Step 6: Let callerOrigin be origin. If callerOrigin is an opaque origin, throw a "NotAllowedError"
    // NOTE: Opaque origin check not implemented. This is a backend virtual authenticator where origins
    // are provided as explicit input parameters rather than derived from browser context.

    // Step 7: Let effectiveDomain be the callerOrigin's effective domain
    const originHostname = new URL(meta.origin).hostname;

    // Step 8: If pkOptions.rp.id is present, validate it; otherwise set it to effectiveDomain
    const rpId = publicKeyCredentialCreationOptions.rp.id ?? originHostname;

    assertSchema(originHostname, createOriginMatchesRpIdSchema(rpId));

    // Validate attestation conveyance preference
    // Only 'none' and 'direct' are currently supported
    const attestation = publicKeyCredentialCreationOptions.attestation;
    if (
      attestation === Attestation.ENTERPRISE ||
      attestation === Attestation.INDIRECT
    ) {
      throw new AttestationNotSupported();
    }

    // Step 9: Let credTypesAndPubKeyAlgs be a new list whose items
    // are pairs of PublicKeyCredentialType and a COSEAlgorithmIdentifier.
    const credTypesAndPubKeyAlgs: {
      type: typeof PublicKeyCredentialType.PUBLIC_KEY;
      alg: number;
    }[] = [];

    if (publicKeyCredentialCreationOptions.pubKeyCredParams.length === 0) {
      // Step 10: If pkOptions.pubKeyCredParams’s size is zero
      // Append the following pairs of PublicKeyCredentialType and COSEAlgorithmIdentifier values to credTypesAndPubKeyAlgs:
      // public-key and -7 ("ES256").
      // public-key and -257 ("RS256").
      credTypesAndPubKeyAlgs.push(
        {
          type: PublicKeyCredentialType.PUBLIC_KEY,
          alg: COSEKeyAlgorithm.ES256,
        },
        {
          type: PublicKeyCredentialType.PUBLIC_KEY,
          alg: COSEKeyAlgorithm.RS256,
        },
      );
    } else {
      // Step 10: If pkOptions.pubKeyCredParams’s size is non-zero
      // For each current of pkOptions.pubKeyCredParams:
      for (const pubKeyCredParam of publicKeyCredentialCreationOptions.pubKeyCredParams) {
        // If current.type does not contain a PublicKeyCredentialType supported by this implementation, then continue.
        if (pubKeyCredParam.type !== PublicKeyCredentialType.PUBLIC_KEY) {
          continue;
        }

        credTypesAndPubKeyAlgs.push(
          pubKeyCredParam as {
            type: typeof PublicKeyCredentialType.PUBLIC_KEY;
            alg: number;
          },
        );
      }

      // If credTypesAndPubKeyAlgs is empty, throw a "NotSupportedError" DOMException.
      if (credTypesAndPubKeyAlgs.length === 0) {
        throw new CredentialTypesNotSupported();
      }
    }

    // Step 11, Step 12: Extensions - Skipped

    // Step 13: Let collectedClientData be a new CollectedClientData instance
    const collectedClientData: CollectedClientData = {
      type: 'webauthn.create',
      challenge: Buffer.from(
        publicKeyCredentialCreationOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
      topOrigin: meta.crossOrigin ? meta.topOrigin : undefined,
    };

    // Step 14: Let clientDataJSON be the JSON-compatible serialization of collectedClientData
    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(collectedClientData)),
    );

    // Step 15: Let clientDataHash be the hash of the serialized client data
    const clientDataHash = Hash.sha256(clientDataJSON);

    // Step 16: If options.signal is present and aborted, throw the options.signal's abort reason
    if (publicKeyCredentialCreationOptions.signal?.aborted) {
      throw publicKeyCredentialCreationOptions.signal.reason;
    }

    // Step 17: Determine attestation statement formats based on attestation conveyance preference
    // Map AttestationConveyancePreference to attestation statement format identifiers
    const attestationPreference =
      publicKeyCredentialCreationOptions.attestation ?? Attestation.NONE;
    let attestationFormats: string[];

    switch (attestationPreference) {
      case Attestation.NONE:
        // No attestation - use 'none' format
        attestationFormats = [Fmt.NONE];
        break;
      case Attestation.DIRECT:
        // Direct attestation - use 'packed' format which provides full attestation
        attestationFormats = [Fmt.PACKED];
        break;
      case Attestation.INDIRECT:
        // Indirect attestation - use 'packed' but authenticator should anonymize
        attestationFormats = [Fmt.PACKED];
        break;
      case Attestation.ENTERPRISE:
        // Enterprise attestation - use 'packed' for individually-identifying attestation
        attestationFormats = [Fmt.PACKED];
        break;
      default:
        attestationFormats = [Fmt.NONE];
    }

    // Step 18: Invoke the authenticatorMakeCredential operation
    const { credentialId, attestationObject } =
      await this.authenticator.authenticatorMakeCredential({
        authenticatorMakeCredentialArgs: {
          hash: clientDataHash,
          rpEntity: {
            name: publicKeyCredentialCreationOptions.rp.name,
            id: rpId,
          },
          userEntity: publicKeyCredentialCreationOptions.user,
          requireResidentKey:
            publicKeyCredentialCreationOptions.authenticatorSelection
              ?.residentKey === ResidentKeyRequirement.REQUIRED ||
            publicKeyCredentialCreationOptions.authenticatorSelection
              ?.requireResidentKey === true,
          requireUserPresence: meta.userPresenceEnabled !== false,
          requireUserVerification:
            meta.userVerificationEnabled !== false &&
            publicKeyCredentialCreationOptions.authenticatorSelection
              ?.userVerification === UserVerificationRequirement.REQUIRED,
          credTypesAndPubKeyAlgs,
          excludeCredentialDescriptorList:
            publicKeyCredentialCreationOptions.excludeCredentials,
          enterpriseAttestationPossible:
            attestationPreference === Attestation.ENTERPRISE,
          attestationFormats,
          extensions: publicKeyCredentialCreationOptions.extensions,
        },
        context,
      });

    // Step 22: Return PublicKeyCredential
    return {
      id: Buffer.from(credentialId).toString('base64url'),
      rawId: credentialId,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: clientDataJSON,
        attestationObject: attestationObject,
      },
      clientExtensionResults: {},
    };
  }

  /**
   * Gets an existing credential (authentication ceremony).
   * This implements the agent/client-side steps of the WebAuthn getAssertion algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
   */
  public async getAssertion(opts: {
    credentialRequestOptions: CredentialRequestOptions;
    meta: VirtualAuthenticatorCredentialMetaArgs;
    context: VirtualAuthenticatorCredentialContextArgs;
  }): Promise<PublicKeyCredential> {
    const { credentialRequestOptions, meta, context } = opts;

    // Step 1: Assert options.publicKey is present (validated by schema)
    const publicKeyCredentialRequestOptions =
      credentialRequestOptions.publicKey;

    assertSchema(
      publicKeyCredentialRequestOptions,
      PublicKeyCredentialRequestOptionsSchema,
    );

    assertSchema(meta, VirtualAuthenticatorCredentialMetaArgsSchema);
    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

    // Step 5-6: Validate origin and RP ID
    const originHostname = new URL(meta.origin).hostname;
    const rpId = publicKeyCredentialRequestOptions.rpId ?? originHostname;

    assertSchema(originHostname, createOriginMatchesRpIdSchema(rpId));

    // Step 7-8: Check user verification availability
    const userVerificationEnabled = meta.userVerificationEnabled ?? true;
    const userPresenceEnabled = meta.userPresenceEnabled ?? true;

    if (
      !userVerificationEnabled &&
      publicKeyCredentialRequestOptions.userVerification ===
        UserVerificationRequirement.REQUIRED
    ) {
      throw new UserVerificationNotAvailable();
    }

    // Step 13: Let collectedClientData be a new CollectedClientData instance
    const collectedClientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge: Buffer.from(
        publicKeyCredentialRequestOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
      topOrigin: meta.crossOrigin ? meta.topOrigin : undefined,
    };

    // Step 14: Let clientDataJSON be the JSON-compatible serialization of collectedClientData
    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(collectedClientData)),
    );

    // Step 15: Let clientDataHash be the hash of the serialized client data
    const clientDataHash = Hash.sha256(clientDataJSON);

    // Step 18: Invoke the authenticatorGetAssertion operation
    const { credentialId, authenticatorData, signature, userHandle } =
      await this.authenticator.authenticatorGetAssertion({
        authenticatorGetAssertionArgs: {
          hash: clientDataHash,
          rpId,
          allowCredentialDescriptorList:
            publicKeyCredentialRequestOptions.allowCredentials,
          requireUserPresence: true,
          requireUserVerification:
            publicKeyCredentialRequestOptions.userVerification ===
            UserVerificationRequirement.REQUIRED,
          extensions: publicKeyCredentialRequestOptions.extensions,
        },
        context,
        userId: meta.userId,
      });

    // Step 20: Return PublicKeyCredential
    return {
      id: Buffer.from(credentialId).toString('base64url'),
      rawId: credentialId,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData,
        signature,
        userHandle,
      },
      clientExtensionResults: {},
    };
  }
}
