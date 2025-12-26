import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { assertSchema } from '@repo/utils';
import * as cbor from 'cbor2';
import z from 'zod';

import type { VirtualAuthenticator } from './VirtualAuthenticator';
import {
  Attestation,
  AuthenticatorAttachment,
  CollectedClientDataType,
  CredentialMediationRequirement,
  Fmt,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from './enums';
import { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import { AttestationNotSupported } from './exceptions/AttestationNotSupported';
import { CredentialTypesNotSupported } from './exceptions/CredentialTypesNotSupported';
import type {
  PubKeyCredParam,
  PublicKeyCredentialDescriptor,
} from './zod-validation';
import type { CollectedClientData } from './zod-validation/CollectedClientDataSchema';
import {
  CredentialCreationOptionsSchema,
  type CredentialCreationOptions,
} from './zod-validation/CredentialCreationOptionsSchema';
import {
  CredentialRequestOptionsSchema,
  type CredentialRequestOptions,
} from './zod-validation/CredentialRequestOptionsSchema';
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
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (Step 23.3)
   * Step 22.SUCCESS.3
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
    // Note: cbor.decode returns a Map when the CBOR data contains a map
    const decodedAttestation = cbor.decode(attestationObjectResult);

    // Ensure we're working with a Map (cbor2 should decode CBOR maps as JavaScript Maps)
    const attestationObject =
      decodedAttestation instanceof Map
        ? decodedAttestation
        : new Map(
            Object.entries(decodedAttestation as Record<string, unknown>),
          );

    // Step 22.SUCCESS.3.1: If credentialCreationData.attestationConveyancePreferenceOption's value is "none"
    if (attestationConveyancePreferenceOption === Attestation.NONE) {
      // Replace potentially uniquely identifying information with non-identifying versions of the same:

      // Extract attestation object components
      const fmt = attestationObject.get('fmt') as string;
      const attStmt = attestationObject.get('attStmt');
      const authData = attestationObject.get('authData') as Uint8Array;

      // Convert attStmt to Map if it's a plain object
      const attStmtMap =
        attStmt instanceof Map
          ? attStmt
          : new Map(Object.entries(attStmt as Record<string, unknown>));

      // Check if aaguid (in authData) is 16 zero bytes
      // AAGUID is located at bytes 37-52 in authData (after rpIdHash [32 bytes], flags [1 byte], signCount [4 bytes])
      const aaguidStartIndex = 37;
      const aaguidEndIndex = 53;
      const aaguid = authData.slice(aaguidStartIndex, aaguidEndIndex);
      const isAaguidZeroed = aaguid.every((byte) => byte === 0);

      // If the aaguid in the attested credential data is 16 zero bytes
      // and credentialCreationData.attestationObjectResult.fmt is "packed"
      // and x5c is absent
      const isSelfAttestation =
        isAaguidZeroed && fmt === Fmt.PACKED && !attStmtMap.has('x5c');

      // then self attestation is being used and no further action is needed.
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

    // Meta validation
    assertSchema(
      meta,
      VirtualAuthenticatorCredentialMetaArgsSchema.safeExtend({
        userId: z.literal(
          UUIDMapper.bytesToUUID(credentialCreationOptions.publicKey.user.id),
        ),
      }),
    );
    // Context validation
    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

    // Step 2: Check sameOriginWithAncestors, mediation, and transient activation
    // NOTE: Browser security checks (sameOriginWithAncestors, mediation, transient activation)
    // are not applicable. This is a backend virtual authenticator for testing where such
    // browser-specific security contexts don't exist.

    // Step 3: Let pkOptions be the value of options.publicKey.
    const pkOptions = credentialCreationOptions.publicKey;

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
        // public-key and -7 ("ES256").
        {
          type: PublicKeyCredentialType.PUBLIC_KEY,
          alg: COSEKeyAlgorithm.ES256,
        },
        // public-key and -257 ("RS256").
        {
          type: PublicKeyCredentialType.PUBLIC_KEY,
          alg: COSEKeyAlgorithm.RS256,
        },
      );
    } else {
      // Step 10: If pkOptions.pubKeyCredParams's size is non-zero
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
    if (credentialCreationOptions.signal?.aborted) {
      throw credentialCreationOptions.signal.reason;
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
    // NOTE: The spec only explicitly handles the NONE case. For DIRECT, INDIRECT, and ENTERPRISE
    // attestation types, this implementation defaults to PACKED format when attestationFormats
    // is empty, which is an implementation decision not specified in the WebAuthn spec.
    switch (pkOptions.attestation) {
      case Attestation.NONE:
        attestationFormats = [Fmt.NONE];
        break;
      case Attestation.DIRECT:
        // If attestationFormats is empty, default to packed format for direct attestation
        if (attestationFormats.length === 0) {
          attestationFormats = [Fmt.PACKED];
        }
        break;
      // INDIRECT and ENTERPRISE: use the provided attestationFormats or default to packed
      case Attestation.INDIRECT:
      case Attestation.ENTERPRISE:
        if (attestationFormats.length === 0) {
          attestationFormats = [Fmt.PACKED];
        }
        break;
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

    // Step 22.SUCCESS: If any authenticator indicates success:

    // Step 22.SUCCESS.1: If any authenticator indicates success (authenticatorMakeCredential returns successfully):
    //   Remove authenticator from issuedRequests.
    // NOTE: Not implemented. Single virtual authenticator always succeeds or throws, no multi-authenticator
    // coordination needed.

    // Step 22.SUCCESS.2: Let credentialCreationData be a struct
    const credentialCreationData = {
      // attestationObjectResult: whose value is the bytes returned from the successful authenticatorMakeCredential operation.
      attestationObjectResult: attestationObject,
      // clientDataJSONResult: whose value is the bytes of clientDataJSON.
      clientDataJSONResult: clientDataJSON,
      // attestationConveyancePreferenceOption: whose value is the value of pkOptions.attestation.
      attestationConveyancePreferenceOption: pkOptions.attestation,
      // clientExtensionResults: whose value is an AuthenticationExtensionsClientOutputs object containing extension identifier -> client extension output entries.
      clientExtensionResults: {},
    };

    // Step 22.SUCCESS.3: Let constructCredentialAlg be an algorithm that takes a global object global
    const processedAttestationObject = this._constructCredentialAlg({
      attestationConveyancePreferenceOption:
        credentialCreationData.attestationConveyancePreferenceOption,
      attestationObjectResult: credentialCreationData.attestationObjectResult,
    });

    // Step 22.SUCCESS.4: Let pubKeyCred be a new PublicKeyCredential object associated
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

    // Step 22.SUCCESS.5: Return pubKeyCred.
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

    // Step 1: Assert options.publicKey is present
    assertSchema(
      credentialRequestOptions,
      CredentialRequestOptionsSchema.safeExtend({
        publicKey: PublicKeyCredentialRequestOptionsSchema,
      }),
    );

    // Meta validation
    assertSchema(meta, VirtualAuthenticatorCredentialMetaArgsSchema);
    // Context validation
    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

    // Step 2: Let pkOptions be the value of options.publicKey.
    const pkOptions = credentialRequestOptions.publicKey;

    let credentialIdFilter: PublicKeyCredentialDescriptor[] = [];
    // Step 3: If options.mediation is present with the value conditional:
    if (
      credentialRequestOptions.mediation ===
      CredentialMediationRequirement.CONDITIONAL
    ) {
      // Step 3.1: Let credentialIdFilter be the value of pkOptions.allowCredentials.
      credentialIdFilter = pkOptions.allowCredentials ?? [];

      // Step 3.2: Set pkOptions.allowCredentials to empty.
      // NOTE: Skipped

      // Step 3.3: Set a timer lifetimeTimer to a value of infinity.
      // NOTE: Not implemented.
    } else {
      // Step 4: Else:
      // Step 4.1: Let credentialIdFilter be an empty list.
      credentialIdFilter = [];

      // Step 4.2: If pkOptions.timeout is present, check if its value lies within a reasonable range as defined by the client and if not, correct it to the closest value lying within that range. Set a timer lifetimeTimer to this adjusted value. If pkOptions.timeout is not present, then set lifetimeTimer to a client-specific default.
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
    }

    // Step 3-4: Handle conditional mediation and set timeout
    // NOTE: Not implemented. Conditional mediation is a browser UI feature for autofill
    // in password fields (tagged with "webauthn" autofill detail token). This allows users
    // to select credentials from a dropdown in form inputs. Since this is a backend virtual
    // authenticator for testing without any browser UI context, conditional mediation is not
    // applicable. The timeout handling (lifetimeTimer) is also not fully implemented as this
    // is a testing environment where timeouts are typically not desired.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion (steps 3-4)

    // Step 5: Let callerOrigin be origin.
    // If callerOrigin is an opaque origin, throw a "NotAllowedError" DOMException.
    // NOTE: The check for opaque origin is not implemented.
    const callerOrigin = meta.origin;

    // Step 6: Let effectiveDomain be the callerOrigin’s effective domain.
    // If effective domain is not a valid domain, then throw a "SecurityError" DOMException.
    // NOTE: The check is not implemented.
    const effectiveDomain = new URL(meta.origin).hostname;

    // Step 7: Process pkOptions.rpId
    // If pkOptions.rpId is present:
    //   If pkOptions.rpId is not a registrable domain suffix of and is not equal to effectiveDomain:
    //     If the client supports related origin requests:
    //       Run the related origins validation procedure with arguments callerOrigin and rpIdRequested.
    //       If the result is false, throw a "SecurityError" DOMException.
    //     If the client does not support related origin requests:
    //       throw a "SecurityError" DOMException.
    // If pkOptions.rpId is not present:
    //   Set pkOptions.rpId to effectiveDomain.
    // NOTE: Related origin requests are not supported. The implementation validates that rpId
    // is a registrable domain suffix of or equal to effectiveDomain.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion (step 7)
    const rpId = pkOptions.rpId ?? effectiveDomain;
    assertSchema(effectiveDomain, createOriginMatchesRpIdSchema(rpId));

    // Step 8: Let clientExtensions be a new map and let authenticatorExtensions be a new map.
    // NOTE: Extensions are not implemented.

    // Step 9: If pkOptions.extensions is present, then ...
    // NOTE: Extensions are not implemented.

    // Step 10: Let collectedClientData be a new CollectedClientData instance
    const collectedClientData: CollectedClientData = {
      type: CollectedClientDataType.WEBAUTHN_GET,
      challenge: Buffer.from(pkOptions.challenge).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
      topOrigin: meta.crossOrigin ? meta.topOrigin : undefined,
    };

    // Step 11: Let clientDataJSON be the JSON-compatible serialization of client data constructed from collectedClientData.
    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(collectedClientData)),
    );

    // Step 12: Let clientDataHash be the hash of the serialized client data represented by clientDataJSON.
    const clientDataHash = Hash.sha256(clientDataJSON);

    // Step 13: If options.signal is present and aborted, throw the options.signal’s abort reason.
    if (credentialRequestOptions.signal?.aborted) {
      throw credentialRequestOptions.signal.reason;
    }

    // Step 14: Let issuedRequests be a new ordered set.
    // NOTE: Not implemented.

    // Step 15: Let savedCredentialIds be a new map.
    // NOTE: Not implemened.

    // Step 16: Let authenticators represent a value which at any given instant is a set of client platform-specific handles, where each item identifies an authenticator presently available on this client platform at that instant.
    // NOTE: Not implemented.

    // Step 17: Let silentlyDiscoveredCredentials be a new map whose entries are of the form: DiscoverableCredentialMetadata -> authenticator.
    // NOTE: Not implemented.

    // Step 18: Consider the value of hints and craft the user interface accordingly, as the user-agent sees fit.
    // NOTE: Not implemented.

    // Step 19: Start lifetimeTimer.
    // NOTE: Not implemented.

    // Step 20: While lifetimeTimer has not expired, perform the following actions depending upon lifetimeTimer, and the state and response for each authenticator in authenticators:
    // NOTE: The steps except SUCCESS are not implemented.

    const { credentialId, authenticatorData, signature, userHandle } =
      await this.authenticator.authenticatorGetAssertion({
        authenticatorGetAssertionArgs: {
          hash: clientDataHash,
          rpId,
          allowCredentialDescriptorList: pkOptions.allowCredentials,
          requireUserPresence: true,
          requireUserVerification:
            pkOptions.userVerification === UserVerificationRequirement.REQUIRED,
          extensions: pkOptions.extensions,
        },
        context,
        userId: meta.userId,
      });

    // Step 20.SUCCESS: If any authenticator indicates success

    // Step 20.SUCCESS.1: Remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.SUCCESS.2: Let assertionCreationData be a struct:
    const assertionCreationData = {
      // credentialIdResult: If savedCredentialIds[authenticator] exists, set the value of credentialIdResult to be the bytes of savedCredentialIds[authenticator]. Otherwise, set the value of credentialIdResult to be the bytes of the credential ID returned from the successful authenticatorGetAssertion operation, as defined in § 6.3.3 The authenticatorGetAssertion Operation.
      credentialIdResult: credentialId,
      // clientDataJSONResult: whose value is the bytes of clientDataJSON.
      clientDataJSONResult: clientDataJSON,
      // authenticatorDataResult: whose value is the bytes of the authenticator data returned by the authenticator.
      authenticatorDataResult: authenticatorData,
      // signatureResult: whose value is the bytes of the signature value returned by the authenticator.
      signatureResult: signature,
      // userHandleResult: If the authenticator returned a user handle, set the value of userHandleResult to be the bytes of the returned user handle. Otherwise, set the value of userHandleResult to null.
      userHandleResult: userHandle,
      // clientExtensionResults: whose value is an AuthenticationExtensionsClientOutputs object containing extension identifier → client extension output entries. The entries are created by running each extension’s client extension processing algorithm to create the client extension outputs, for each client extension in pkOptions.extensions.
      // NOTE: Extensions are not implemented.
      clientExtensionResults: {},
    };

    // STEP 20.SUCCESS.3: If credentialIdFilter is not empty and credentialIdFilter does not contain an item whose id’s value is set to the value of credentialIdResult, continue.
    // NOTE:
    if (credentialIdFilter?.length > 0) {
      const containsCredentialId = credentialIdFilter.find(
        (credentialIdFilterItem) =>
          credentialIdFilterItem.id ===
          assertionCreationData.credentialIdResult,
      );

      if (containsCredentialId === undefined) {
        // continue.
        throw new Error('No credential was found.');
      }
    }

    // Step 20.SUCCESS.4: If credentialIdFilter is empty and userHandleResult is null, continue.
    if (
      credentialIdFilter.length === 0 &&
      assertionCreationData.userHandleResult === null
    ) {
      // continue.
      throw new Error('No credential was found.');
    }

    // Step 20.SUCCESS.5: Let settings be the current settings object. Let global be settings’ global object.
    // NOTE: Not implemented.

    // Step 20.SUCCESS.6: Let pubKeyCred be a new PublicKeyCredential:
    const pubKeyCred = {
      id: Buffer.from(assertionCreationData.credentialIdResult).toString(
        'base64url',
      ),
      rawId: assertionCreationData.credentialIdResult,
      // The AuthenticatorAttachment value matching the current authenticator attachment modality of authenticator.
      authenticatorAttachment: AuthenticatorAttachment.CROSS_PLATFORM,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData,
        signature,
        userHandle,
      },
      // NOTE: Extensions are not implemented.
      clientExtensionResults: {},
    };

    // Step 20.SUCCESS.7: For each remaining authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator and remove it from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.SUCCESS.8: Return pubKeyCred and terminate this algorithm.
    return pubKeyCred;
  }
}
