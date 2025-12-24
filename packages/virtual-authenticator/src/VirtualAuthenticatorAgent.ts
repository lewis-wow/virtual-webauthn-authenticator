import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { assertSchema } from '@repo/utils';
import * as cbor from 'cbor2';
import z from 'zod';

import type { VirtualAuthenticator } from './VirtualAuthenticator';
import {
  Attestation,
  CollectedClientDataType,
  Fmt,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from './enums';
import { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import { AttestationNotSupported } from './exceptions/AttestationNotSupported';
import { CredentialTypesNotSupported } from './exceptions/CredentialTypesNotSupported';
import { UserVerificationNotAvailable } from './exceptions/UserVerificationNotAvailable';
import type { PubKeyCredParam } from './zod-validation';
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
  // @see https://www.w3.org/TR/webauthn-3/#recommended-range-and-default-for-a-webauthn-ceremony-timeout
  static readonly DEFAULT_TIMEOUT_MILLIS = 300_000;
  static readonly MIN_TIMEOUT_MILLIS = 30_000;
  static readonly MAX_TIMEOUT_MILLIS = 600_000;

  private readonly authenticator: VirtualAuthenticator;

  constructor(opts: VirtualAuthenticatorAgentOptions) {
    this.authenticator = opts.authenticator;
  }

  /**
   * Calculate the effective resident key requirement for credential creation.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (Step 22.3)
   *
   * @param authenticatorSelection - The authenticatorSelection from PublicKeyCredentialCreationOptions
   * @returns Boolean indicating whether resident key is required
   */
  private _calculateEffectiveResidentKeyRequirement(opts: {
    authenticatorSelection:
      | {
          residentKey?: ResidentKeyRequirement;
          requireResidentKey?: boolean;
          userVerification?: UserVerificationRequirement;
          authenticatorAttachment?: string;
        }
      | undefined;
  }): boolean {
    const { authenticatorSelection } = opts;

    // If pkOptions.authenticatorSelection.residentKey is present and set to required
    if (
      authenticatorSelection?.residentKey === ResidentKeyRequirement.REQUIRED
    ) {
      // Let requireResidentKey be true.
      return true;
    }

    // If pkOptions.authenticatorSelection.residentKey is present and set to preferred
    if (
      authenticatorSelection?.residentKey === ResidentKeyRequirement.PREFERRED
    ) {
      // If the authenticator is capable of client-side credential storage modality
      // NOTE: Virtual authenticator is always capable of client-side credential storage
      return true;
    }

    // If pkOptions.authenticatorSelection.residentKey is present and set to discouraged
    if (
      authenticatorSelection?.residentKey === ResidentKeyRequirement.DISCOURAGED
    ) {
      // Let requireResidentKey be false.
      return false;
    }

    // If pkOptions.authenticatorSelection.residentKey is not present
    // Let requireResidentKey be the value of pkOptions.authenticatorSelection.requireResidentKey
    return authenticatorSelection?.requireResidentKey ?? false;
  }

  /**
   * Calculate the effective user verification requirement for credential creation.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (Step 22.4)
   *
   * @param userVerification - The userVerification from authenticatorSelection
   * @param userVerificationEnabled - Whether the authenticator is capable of user verification
   * @returns Boolean indicating whether user verification is required
   */
  private _calculateEffectiveUserVerificationRequirement(opts: {
    userVerification: UserVerificationRequirement | undefined;
    userVerificationEnabled: boolean;
  }): boolean {
    const { userVerification, userVerificationEnabled } = opts;

    // If pkOptions.authenticatorSelection.userVerification is set to required
    if (userVerification === UserVerificationRequirement.REQUIRED) {
      // NOTE: Conditional mediation check skipped (not applicable to backend authenticator)
      // If options.mediation is set to conditional and user verification cannot be collected during the ceremony,
      // throw a ConstraintError DOMException.

      // Let userVerification be true.
      return true;
    }

    // If pkOptions.authenticatorSelection.userVerification is set to preferred
    if (userVerification === UserVerificationRequirement.PREFERRED) {
      // If the authenticator is capable of user verification
      if (userVerificationEnabled) {
        // Let userVerification be true.
        return true;
      } else {
        // is not capable of user verification
        // Let userVerification be false.
        return false;
      }
    }

    // If pkOptions.authenticatorSelection.userVerification is set to discouraged (or not present)
    // Let userVerification be false.
    return false;
  }

  /**
   * Construct credential algorithm - handles attestation conveyance preference.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (Step 23.3.1)
   *
   * This method modifies the attestation object based on the attestation conveyance preference:
   * - none: Replaces potentially identifying information with non-identifying versions
   * - indirect: MAY replace with more privacy-friendly version (not implemented)
   * - direct/enterprise: Conveys unaltered attestation
   *
   * @param attestationConveyancePreferenceOption - The attestation preference from options
   * @param attestationObjectResult - The CBOR-encoded attestation object from authenticator
   * @returns Modified CBOR-encoded attestation object
   */
  private _constructCredentialAlg(opts: {
    attestationConveyancePreferenceOption: Attestation | undefined;
    attestationObjectResult: Uint8Array;
  }): Uint8Array {
    const { attestationConveyancePreferenceOption, attestationObjectResult } =
      opts;

    // Decode the CBOR attestation object
    const attestationObject = cbor.decode(attestationObjectResult) as Map<
      string,
      unknown
    >;

    // If credentialCreationData.attestationConveyancePreferenceOption's value is "none"
    if (attestationConveyancePreferenceOption === Attestation.NONE) {
      // Replace potentially uniquely identifying information with non-identifying versions of the same:

      // Extract attestation object components
      const fmt = attestationObject.get('fmt') as string;
      const attStmt = attestationObject.get('attStmt') as Map<string, unknown>;
      const authData = attestationObject.get('authData') as Uint8Array;

      // Check if aaguid (in authData) is 16 zero bytes
      // AAGUID is located at bytes 37-52 in authData (after rpIdHash [32 bytes], flags [1 byte], signCount [4 bytes])
      const aaguidStartIndex = 37;
      const aaguidEndIndex = 53;
      const aaguid = authData.slice(aaguidStartIndex, aaguidEndIndex);
      const isAaguidZeroed = aaguid.every((byte) => byte === 0);

      // Check if self attestation is being used
      const isSelfAttestation =
        isAaguidZeroed && fmt === Fmt.PACKED && !attStmt.has('x5c');

      // If self attestation is being used, no further action needed
      if (isSelfAttestation) {
        return attestationObjectResult;
      }

      // Otherwise: Set fmt to "none" and attStmt to empty CBOR map
      attestationObject.set('fmt', Fmt.NONE);
      attestationObject.set('attStmt', new Map<string, unknown>());

      // Re-encode the modified attestation object
      return new Uint8Array(cbor.encode(attestationObject));
    }

    // If "indirect": The client MAY replace with more privacy-friendly version
    // NOTE: Not implemented - we convey unaltered for indirect
    if (attestationConveyancePreferenceOption === Attestation.INDIRECT) {
      return attestationObjectResult;
    }

    // If "direct" or "enterprise": Convey the authenticator's AAGUID and attestation statement, unaltered
    return attestationObjectResult;
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

    // Step 2: Check sameOriginWithAncestors, mediation, and transient activation
    // NOTE: Browser security checks (sameOriginWithAncestors, mediation, transient activation)
    // are not applicable. This is a backend virtual authenticator for testing where such
    // browser-specific security contexts don't exist.

    // Step 3: Let pkOptions be the value of options.publicKey.
    const pkOptions = credentialCreationOptions.publicKey;

    assertSchema(
      meta,
      VirtualAuthenticatorCredentialMetaArgsSchema.safeExtend({
        userId: z.literal(UUIDMapper.bytesToUUID(pkOptions.user.id)),
      }),
    );

    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

    // Step 4: If pkOptions.timeout is present, check if its value lies within a reasonable range as defined by the client
    // and if not, correct it to the closest value lying within that range.
    // Set a timer lifetimeTimer to this adjusted value.
    // If pkOptions.timeout is not present, then set lifetimeTimer to a client-specific default.
    // @see https://www.w3.org/TR/webauthn-3/#recommended-range-and-default-for-a-webauthn-ceremony-timeout
    // let lifetimeTimer = VirtualAuthenticatorAgent.DEFAULT_TIMEOUT_MILLIS;
    // if (pkOptions.timeout !== undefined) {
    //   // Correct to closest value within reasonable range
    //   lifetimeTimer = Math.max(
    //     VirtualAuthenticatorAgent.MIN_TIMEOUT_MILLIS,
    //     Math.min(
    //       VirtualAuthenticatorAgent.MAX_TIMEOUT_MILLIS,
    //       pkOptions.timeout,
    //     ),
    //   );
    // }

    // Step 5: Validate user.id length is between 1 and 64 bytes
    // NOTE: handled by schema validation

    // Step 6: Let callerOrigin be origin. If callerOrigin is an opaque origin, throw a "NotAllowedError"
    // NOTE: Opaque origin check not implemented. This is a backend virtual authenticator where origins
    // are provided as explicit input parameters rather than derived from browser context.

    // Step 7: Let effectiveDomain be the callerOrigin's effective domain
    const effectiveDomain = new URL(meta.origin).hostname;

    // Step 8: If pkOptions.rp.id is present, validate it; otherwise set it to effectiveDomain
    const rpId = pkOptions.rp.id ?? effectiveDomain;
    assertSchema(effectiveDomain, createOriginMatchesRpIdSchema(rpId));

    // Validate attestation conveyance preference
    // Only 'none' and 'direct' are currently supported
    const attestation = pkOptions.attestation;
    if (
      attestation === Attestation.ENTERPRISE ||
      attestation === Attestation.INDIRECT
    ) {
      throw new AttestationNotSupported();
    }

    // Step 9: Let credTypesAndPubKeyAlgs be a new list whose items
    // are pairs of PublicKeyCredentialType and a COSEAlgorithmIdentifier.
    const credTypesAndPubKeyAlgs: PubKeyCredParam[] = [];

    // Step 10: If pkOptions.pubKeyCredParams’s size is zero
    if (pkOptions.pubKeyCredParams.length === 0) {
      // Append the following pairs of PublicKeyCredentialType and COSEAlgorithmIdentifier values to credTypesAndPubKeyAlgs:
      credTypesAndPubKeyAlgs.push(
        {
          type: PublicKeyCredentialType.PUBLIC_KEY,
          // public-key and -7 ("ES256").
          alg: COSEKeyAlgorithm.ES256,
        },
        {
          type: PublicKeyCredentialType.PUBLIC_KEY,
          // public-key and -257 ("RS256").
          alg: COSEKeyAlgorithm.RS256,
        },
      );
    } /* Step 10: If pkOptions.pubKeyCredParams’s size is non-zero */ else {
      // For each current of pkOptions.pubKeyCredParams:
      for (const pubKeyCredParam of pkOptions.pubKeyCredParams) {
        // If current.type does not contain a PublicKeyCredentialType supported by this implementation, then continue.
        if (pubKeyCredParam.type !== PublicKeyCredentialType.PUBLIC_KEY) {
          continue;
        }

        credTypesAndPubKeyAlgs.push(pubKeyCredParam as PubKeyCredParam);
      }

      // If credTypesAndPubKeyAlgs is empty, throw a "NotSupportedError" DOMException.
      if (credTypesAndPubKeyAlgs.length === 0) {
        throw new CredentialTypesNotSupported();
      }
    }

    // Step 11: Let clientExtensions be a new map and let authenticatorExtensions be a new map.
    // Note: Not implemented

    // Step 12: If pkOptions.extensions is present, then ...
    // Note: Not implemented

    // Step 13: Let collectedClientData be a new CollectedClientData instance
    const collectedClientData: CollectedClientData = {
      type: CollectedClientDataType.WEBAUTHN_CREATE,
      challenge: Buffer.from(pkOptions.challenge).toString('base64url'),
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
    if (pkOptions.signal?.aborted) {
      throw pkOptions.signal.reason;
    }

    // Step 17: Let issuedRequests be a new ordered set.
    // NOTE: Not implemented. This is a single virtual authenticator environment, not a multi-authenticator client platform.

    // Step 18: Let authenticators represent available authenticators on this client platform
    // NOTE: Not implemented. This virtual authenticator is always available as the sole authenticator.

    // Step 19: If options.mediation is present with the value conditional, check consent
    // NOTE: Already handled in Step 2. Conditional mediation is not applicable to backend virtual authenticators.

    // Step 20: Consider the value of hints and craft the user interface accordingly
    // NOTE: Not implemented. This is a backend virtual authenticator with no user interface.

    // Step 21: Start lifetimeTimer
    // NOTE: Partially implemented. Timer value calculated in Step 4 but timeout handling not fully implemented
    // as this is a testing environment where timeouts are typically not desired.

    // Step 22: While lifetimeTimer has not expired, handle authenticator availability
    // NOTE: Most substeps not applicable to single virtual authenticator. Relevant logic extracted below:

    // Step 22 (authenticator becomes available): Check authenticatorAttachment
    // NOTE: Not implemented. Virtual authenticator has no specific attachment modality requirement.

    // Step 22 (authenticator becomes available): Calculate effective resident key requirement

    // Step 22.2.1: If pkOptions.authenticatorSelection.authenticatorAttachment is present and its value is not equal to authenticator’s authenticator attachment modality, continue.
    // NOTE: Not implemented

    // Step 22.2.2: If pkOptions.authenticatorSelection.residentKey
    // NOTE: The Virtual Authenticator always supports client-side discoverable public key credential source
    // @see https://www.w3.org/TR/webauthn-3/#client-side-discoverable-public-key-credential-source

    // Step 22.2.3: If pkOptions.authenticatorSelection.userVerification is set to required and the authenticator is not capable of performing user verification, continue.
    // NOTE: The Virtual Authenticator is always capable of performing user verification

    // Step 22.3: Let requireResidentKey be the effective resident key requirement for credential creation, a Boolean value, as follows:
    const requireResidentKey = this._calculateEffectiveResidentKeyRequirement({
      authenticatorSelection: pkOptions.authenticatorSelection,
    });

    // Step 22.4: Let userVerification be the effective user verification requirement for credential creation, a Boolean value, as follows.
    const requireUserVerification =
      this._calculateEffectiveUserVerificationRequirement({
        userVerification: pkOptions.authenticatorSelection?.userVerification,
        userVerificationEnabled: meta.userVerificationEnabled !== false,
      });

    // Step 22.5: Let enterpriseAttestationPossible be a Boolean value, as follows.
    // If pkOptions.attestation is set to enterprise:
    //   Let enterpriseAttestationPossible be true if the user agent wishes to support
    //   enterprise attestation for pkOptions.rp.id (see step 8, above). Otherwise false.
    // Otherwise:
    //   Let enterpriseAttestationPossible be false.
    // NOTE: Virtual authenticator does not support enterprise attestation
    const enterpriseAttestationPossible = false;

    // Step 22.6: Let attestationFormats be a list of strings, initialized to the value of pkOptions.attestationFormats.
    // NOTE: pkOptions.attestationFormats not implemented in schema, initialized below
    let attestationFormats: string[] = pkOptions.attestationFormats ?? [];

    // Step 22.7: If pkOptions.attestation is set to none:
    //   Set attestationFormats to the single-element list containing the string "none"
    if (pkOptions.attestation === Attestation.NONE) {
      attestationFormats = [Fmt.NONE];
    }

    // Step 22.8: Let excludeCredentialDescriptorList be a new list.
    // Step 22.9: For each credential descriptor C in pkOptions.excludeCredentials:
    //   If C.transports is not empty, and authenticator is connected over a transport
    //   not mentioned in C.transports, the client MAY continue.
    //   Note: If the client chooses to continue, this could result in inadvertently
    //   registering multiple credentials bound to the same authenticator if the transport
    //   hints in C.transports are not accurate. For example, stored transport hints could
    //   become inaccurate as a result of software upgrades adding new connectivity options.
    //   Otherwise, Append C to excludeCredentialDescriptorList.
    // NOTE: Transport filtering not implemented. Virtual authenticator accepts all credential
    // descriptors as it represents a single transport-agnostic authenticator.
    const excludeCredentialDescriptorList = pkOptions.excludeCredentials ?? [];

    // Step 22.10: Invoke the authenticatorMakeCredential operation on authenticator.
    const { credentialId, attestationObject } =
      await this.authenticator.authenticatorMakeCredential({
        authenticatorMakeCredentialArgs: {
          hash: clientDataHash,
          rpEntity: {
            name: pkOptions.rp.name,
            id: rpId,
          },
          userEntity: pkOptions.user,
          requireResidentKey,
          requireUserPresence: meta.userPresenceEnabled !== false,
          requireUserVerification,
          credTypesAndPubKeyAlgs,
          excludeCredentialDescriptorList,
          enterpriseAttestationPossible,
          attestationFormats,
          extensions: pkOptions.extensions,
        },
        context,
      });

    // Step 22.11: Append authenticator to issuedRequests.
    // NOTE: Not implemented. Single virtual authenticator, no request tracking needed.

    // Step 32: If any authenticator indicates success:

    // Step 23.1: If any authenticator indicates success (authenticatorMakeCredential returns successfully):
    //   Remove authenticator from issuedRequests.
    // NOTE: Not implemented. Single virtual authenticator always succeeds or throws, no multi-authenticator
    // coordination needed.

    // Step 23.2: Let credentialCreationData be a struct
    const credentialCreationData = {
      // attestationObjectResult: whose value is the bytes returned from the successful authenticatorMakeCredential operation.
      attestationObjectResult: attestationObject,
      // clientDataJSONResult: whose value is the bytes of clientDataJSON.
      clientDataJSONResult: clientDataJSON,
      // attestationConveyancePreferenceOption: whose value is the value of pkOptions.attestation.
      attestationConveyancePreferenceOption: pkOptions.attestation,
      // clientExtensionResults: whose value is an AuthenticationExtensionsClientOutputs object containing extension identifier → client extension output entries.
      clientExtensionResults: {},
    };

    // Step 23.3: Let constructCredentialAlg be an algorithm that takes a global object global
    // Step 23.3.1: Handle attestation conveyance preference
    const processedAttestationObject = this._constructCredentialAlg({
      attestationConveyancePreferenceOption:
        credentialCreationData.attestationConveyancePreferenceOption,
      attestationObjectResult: credentialCreationData.attestationObjectResult,
    });

    // Step 23.4: Let pubKeyCred be a new PublicKeyCredential object associated
    const pubKeyCred = {
      id: Buffer.from(credentialId).toString('base64url'),
      rawId: credentialId,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: clientDataJSON,
        attestationObject: processedAttestationObject,
      },
      clientExtensionResults: {},
    };

    console.log({ pubKeyCred });

    // Step 23.5: Return pubKeyCred.
    return pubKeyCred;
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
