import { assertSchema } from '@repo/assert';
import * as cbor from '@repo/cbor';
import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import type { Uint8Array_ } from '@repo/types';
import z from 'zod';

import type { IAuthenticator } from '../authenticator/IAuthenticator';
import { CredentialSelectException } from '../authenticator/exceptions/CredentialSelectException';
import { UserVerificationNotAvailable } from '../authenticator/exceptions/UserVerificationNotAvailable';
import { decodeAttestationObject } from '../cbor/decodeAttestationObject';
import { parseAuthenticatorData } from '../cbor/parseAuthenticatorData';
import { PublicKeyCredentialCreationOptionsDtoSchema } from '../dto/spec/PublicKeyCredentialCreationOptionsDtoSchema';
import { PublicKeyCredentialRequestOptionsDtoSchema } from '../dto/spec/PublicKeyCredentialRequestOptionsDtoSchema';
import { Attestation } from '../enums/Attestation';
import { AuthenticatorAttachment } from '../enums/AuthenticatorAttachment';
import { AuthenticatorAuthenticationExtension } from '../enums/AuthenticatorAuthenticationExtension';
import { AuthenticatorRegistrationExtension } from '../enums/AuthenticatorRegistrationExtension';
import { AuthenticatorTransport } from '../enums/AuthenticatorTransport';
import { ClientAuthenticationExtension } from '../enums/ClientAuthenticationExtension';
import { ClientRegistrationExtension } from '../enums/ClientRegistrationExtension';
import { CollectedClientDataType } from '../enums/CollectedClientDataType';
import { CredentialMediationRequirement } from '../enums/CredentialMediationRequirement';
import { Fmt } from '../enums/Fmt';
import { PublicKeyCredentialType } from '../enums/PublicKeyCredentialType';
import { ResidentKey } from '../enums/ResidentKey';
import { UserVerification } from '../enums/UserVerification';
import { UserPresenceRequired, UserVerificationRequired } from '../exceptions';
import { CredentialNotFound } from '../exceptions/CredentialNotFound';
import { CredentialTypesNotSupported } from '../exceptions/CredentialTypesNotSupported';
import {
  AuthenticationPrevStateSchema,
  type AuthenticationPrevState,
} from '../state/AuthenticationPrevStateSchema';
import type { AuthenticationState } from '../state/AuthenticationStateSchema';
import {
  RegistrationPrevStateSchema,
  type RegistrationPrevState,
} from '../state/RegistrationPrevStateSchema';
import type { RegistrationState } from '../state/RegistrationStateSchema';
import { StateManager } from '../state/StateManager';
import type { AuthenticatorGetAssertionResponse } from '../validation/authenticator/AuthenticatorGetAssertionResponseSchema';
import { AuthenticatorAgentMetaArgsSchema } from '../validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import type { AuthenticatorAgentMetaArgs } from '../validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import { createOriginMatchesRpIdSchema } from '../validation/authenticatorAgent/createOriginMatchesRpIdSchema';
import type { CollectedClientData } from '../validation/spec/CollectedClientDataSchema';
import type { PubKeyCredParam } from '../validation/spec/CredParamSchema';
import { CredentialCreationOptionsSchema } from '../validation/spec/CredentialCreationOptionsSchema';
import { CredentialRequestOptionsSchema } from '../validation/spec/CredentialRequestOptionsSchema';
import { PublicKeyCredentialCreationOptionsSchema } from '../validation/spec/PublicKeyCredentialCreationOptionsSchema';
import type { PublicKeyCredentialCreationOptions } from '../validation/spec/PublicKeyCredentialCreationOptionsSchema';
import type { PublicKeyCredentialDescriptor } from '../validation/spec/PublicKeyCredentialDescriptorSchema';
import { PublicKeyCredentialRequestOptionsSchema } from '../validation/spec/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredentialRequestOptions } from '../validation/spec/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredential } from '../validation/spec/PublicKeyCredentialSchema';
import type {
  IAuthenticatorAgent,
  VirtualAuthenticatorAgentCreateCredentialArgs,
  VirtualAuthenticatorAgentGetAssertionArgs,
} from './IAuthenticatorAgent';
import { CredentialSelectAgentException } from './exceptions/CredentialSelectAgentException';
import { UserPresenceRequiredAgentException } from './exceptions/UserPresenceRequiredAgentException';
import { UserVerificationRequiredAgentException } from './exceptions/UserVerificationRequiredAgentException';
import type { ExtensionProcessor } from './extensions/ExtensionProcessor';

export type VirtualAuthenticatorAgentOptions = {
  authenticator: IAuthenticator;
  extensionProcessor: ExtensionProcessor;
  stateManager: StateManager;
};

/**
 * Virtual WebAuthn Agent (Client) implementation.
 * This class implements the client/browser-side logic of WebAuthn ceremonies.
 * It coordinates with the VirtualAuthenticator for authenticator operations.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
 * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
 */
export class VirtualAuthenticatorAgent implements IAuthenticatorAgent {
  // @see https://www.w3.org/TR/webauthn-3/#recommended-range-and-default-for-a-webauthn-ceremony-timeout
  static readonly DEFAULT_TIMEOUT_MILLIS = 300_000;
  static readonly MIN_TIMEOUT_MILLIS = 30_000;
  static readonly MAX_TIMEOUT_MILLIS = 600_000;

  private readonly authenticator: IAuthenticator;
  private readonly extensionProcessor: ExtensionProcessor;
  private readonly stateManager: StateManager;

  constructor(opts: VirtualAuthenticatorAgentOptions) {
    this.authenticator = opts.authenticator;
    this.extensionProcessor = opts.extensionProcessor;
    this.stateManager = opts.stateManager;
  }

  private async _mapAuthenticatorErrorToAgentError(opts: {
    error: unknown;
    prevState: RegistrationPrevState | AuthenticationPrevState;
  }): Promise<unknown> {
    const { error, prevState } = opts;
    const stateToken = await this.stateManager.createToken(prevState);

    if (error instanceof CredentialSelectException) {
      return new CredentialSelectAgentException({
        ...error.data,
        stateToken,
      });
    }

    if (error instanceof UserPresenceRequired) {
      return new UserPresenceRequiredAgentException({
        stateToken,
      });
    }

    if (error instanceof UserVerificationRequired) {
      return new UserVerificationRequiredAgentException({
        stateToken,
      });
    }

    return error;
  }

  /**
   * This algorithm returns false if the client determines that the authenticator is not capable of handling the request, or true if the request was issued successfully.
   * @see https://www.w3.org/TR/webauthn-3/#publickeycredential-issuing-a-credential-request-to-an-authenticator
   */
  private async _issueCredentialRequestToAuthenticator(opts: {
    // authenticator: A client platform-specific handle identifying an authenticator presently available on this client platform.
    authenticator: IAuthenticator;
    // savedCredentialIds: A map containing authenticator -> credential ID. This argument will be modified in this algorithm.
    // NOTE: Not used, just for the compatibility with spec.
    savedCredentialIds: undefined; // Map<IAuthenticator, Uint8Array_>;
    // pkOptions: This argument is a PublicKeyCredentialRequestOptions object specifying the desired attributes of the public key credential to discover.
    pkOptions: PublicKeyCredentialRequestOptions;
    // rpId: The request RP ID.
    rpId: string;
    // clientDataHash: The hash of the serialized client data represented by clientDataJSON.
    clientDataHash: Uint8Array_;
    // authenticatorExtensions: A map containing extension identifiers to the base64url encoding of the client extension processing output for authenticator extensions.
    authenticatorExtensions: Record<string, unknown>;

    // Custom options
    meta: AuthenticatorAgentMetaArgs;
    state: AuthenticationPrevState;
  }): Promise<AuthenticatorGetAssertionResponse> {
    const {
      authenticator,
      // savedCredentialIds,
      pkOptions,
      rpId,
      clientDataHash,
      authenticatorExtensions,
      meta,
      state,
    } = opts;

    // Step 1: If pkOptions.userVerification is set to required and the authenticator is not capable of performing user verification, return false.
    // Note: As we have single authenticator, we can throw UserVerificationNotAvailable error
    if (
      pkOptions.userVerification === UserVerification.REQUIRED &&
      meta.userVerificationEnabled === false
    ) {
      throw new UserVerificationNotAvailable();
    }

    // Step 2: Let userVerification be the effective user verification requirement for assertion, a Boolean value, as follows. If pkOptions.userVerification
    const requireUserVerification =
      this._calculateEffectiveUserVerificationRequirement({
        userVerification: pkOptions.userVerification,
        userVerificationEnabled: meta.userVerificationEnabled,
      });

    let allowCredentialDescriptorList:
      | PublicKeyCredentialDescriptor[]
      | undefined = undefined;

    // Step 3: If pkOptions.allowCredentials is not empty:
    if (pkOptions.allowCredentials && pkOptions.allowCredentials.length > 0) {
      // Step 3.1: Let allowCredentialDescriptorList be a new list.
      // NOTE: Handled by next step.

      // Step 3.2: Execute a client platform-specific procedure to determine which, if any,
      // public key credentials described by pkOptions.allowCredentials are bound to this authenticator,
      // by matching with rpId, pkOptions.allowCredentials.id, and pkOptions.allowCredentials.type.
      // Set allowCredentialDescriptorList to this filtered list.
      const webAuthnPublicKeyCredentialWithMetaList =
        await authenticator.webAuthnRepository.findAllByRpIdAndCredentialIds({
          rpId,
          credentialIds: pkOptions.allowCredentials
            .map((allowCredential) =>
              UUIDMapper.tryBytesToUUID(allowCredential.id),
            )
            .filter((allowCredentialId) => allowCredentialId !== null),
        });

      allowCredentialDescriptorList =
        webAuthnPublicKeyCredentialWithMetaList.map(
          (webAuthnPublicKeyCredentialWithMeta) => ({
            id: UUIDMapper.UUIDtoBytes(webAuthnPublicKeyCredentialWithMeta.id),
            type: PublicKeyCredentialType.PUBLIC_KEY,
            transports: webAuthnPublicKeyCredentialWithMeta.transports,
          }),
        );

      // Step 3.3: If allowCredentialDescriptorList is empty, return false.
      // NOTE: As we have single authenticator, we can throw CredentialNotFound error
      if (allowCredentialDescriptorList.length === 0) {
        throw new CredentialNotFound();
      }

      // Step 3.4: Let distinctTransports be a new ordered set.
      // NOTE: Transports not implemented.

      // Step 3.5: If allowCredentialDescriptorList has exactly one value,
      // set savedCredentialIds[authenticator] to allowCredentialDescriptorList[0].id’s value
      // (see here in §6.3.3 The authenticatorGetAssertion Operation for more information).
      // NOTE: Not implemented. We don't need to use savedCredentialIds as we have single authenticator.

      // Step 3.6: For each credential descriptor C in allowCredentialDescriptorList,
      // append each value, if any, of C.transports to distinctTransports.
      // NOTE: Transports not implemented.

      // Step 3.7 If distinctTransports is not empty:
      // NOTE: Not implemented.

      // Step 3.7: If distinctTransports is empty:
      // Using local configuration knowledge of the appropriate transport to use with authenticator,
      // invoke the authenticatorGetAssertion operation on authenticator
      // with rpId, clientDataHash, allowCredentialDescriptorList, userVerification, and authenticatorExtensions as parameters.
      // NOTE: Handled with the second branch of step 3 below
    }

    // Step 3: If pkOptions.allowCredentials is empty:
    // Using local configuration knowledge of the appropriate transport to use with authenticator,
    // invoke the authenticatorGetAssertion operation on authenticator
    // with rpId, clientDataHash, allowCredentialDescriptorList, userVerification, and authenticatorExtensions as parameters.

    // Note: In this case, the Relying Party did not supply a list of acceptable credential descriptors.
    // Thus, the authenticator is being asked to exercise any credential
    // it may possess that is scoped to the Relying Party, as identified by rpId.

    // Before invoking the authenticatorGetAssertion operation,
    // the client MUST invoke the authenticatorCancel operation in order to abort all other operations in progress in the authenticator session.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
    // NOTE: Not implemented.

    try {
      const authenticatorGetAssertionPayload =
        await authenticator.authenticatorGetAssertion({
          authenticatorGetAssertionArgs: {
            allowCredentialDescriptorList,
            authenticatorExtensions: authenticatorExtensions,
            hash: clientDataHash,
            rpId,
            requireUserPresence: true,
            requireUserVerification,
          },
          meta: {
            userId: meta.userId,
            apiKeyId: meta.apiKeyId,
            userPresenceEnabled: meta.userPresenceEnabled,
            userVerificationEnabled: meta.userVerificationEnabled,
          },
          state,
        });

      // Step 4: Return true.
      // NOTE: We don't need to use savedCredentialIds and saved authenticatorGetAssertion payload.
      // We have single authenticator, so we can directly return the payload.
      return authenticatorGetAssertionPayload;
    } catch (error) {
      throw await this._mapAuthenticatorErrorToAgentError({
        error,
        prevState: state,
      });
    }
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
          residentKey?: ResidentKey;
          requireResidentKey?: boolean;
          userVerification?: UserVerification;
          authenticatorAttachment?: string;
        }
      | undefined;
  }): boolean {
    const { authenticatorSelection } = opts;

    // If pkOptions.authenticatorSelection.residentKey is present and set to
    // required
    if (authenticatorSelection?.residentKey === ResidentKey.REQUIRED) {
      // Let requireResidentKey be true.
      return true;
    }

    // If pkOptions.authenticatorSelection.residentKey is present and set to
    // preferred
    if (authenticatorSelection?.residentKey === ResidentKey.PREFERRED) {
      // If the authenticator is capable of client-side credential storage
      // modality
      // NOTE: Virtual authenticator is always capable of client-side
      // credential storage
      return true;
    }

    // If pkOptions.authenticatorSelection.residentKey is present and set to
    // discouraged
    if (authenticatorSelection?.residentKey === ResidentKey.DISCOURAGED) {
      // Let requireResidentKey be false.
      return false;
    }

    // If pkOptions.authenticatorSelection.residentKey is not present
    // Let requireResidentKey be the value of
    // pkOptions.authenticatorSelection.requireResidentKey
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
    userVerification: UserVerification | undefined;
    userVerificationEnabled?: boolean;
  }): boolean {
    const { userVerification, userVerificationEnabled = true } = opts;

    // If pkOptions.authenticatorSelection.userVerification is set to required
    if (userVerification === UserVerification.REQUIRED) {
      // NOTE: Conditional mediation check skipped (not applicable to backend
      // authenticator)
      // If options.mediation is set to conditional and user verification
      // cannot be collected during the ceremony, throw a ConstraintError
      // DOMException.

      // Let userVerification be true.
      return true;
    }

    // If pkOptions.authenticatorSelection.userVerification is set to preferred
    if (userVerification === UserVerification.PREFERRED) {
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

    // If pkOptions.authenticatorSelection.userVerification is set to
    // discouraged (or not present)
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
    attestationObjectResult: Uint8Array_;
  }): Uint8Array_ {
    const { attestationConveyancePreferenceOption, attestationObjectResult } =
      opts;

    // Decode the CBOR attestation object
    // Note: cbor.decode returns a Map when the CBOR data contains a map
    const attestationObject = decodeAttestationObject(attestationObjectResult);

    // Step 22.SUCCESS.3.1: If
    // credentialCreationData.attestationConveyancePreferenceOption's value is
    // "none"
    if (attestationConveyancePreferenceOption === Attestation.NONE) {
      // Replace potentially uniquely identifying information with
      // non-identifying versions of the same:

      // Extract attestation object components
      const fmt = attestationObject.get('fmt');
      const attStmt = attestationObject.get('attStmt');
      const authData = attestationObject.get('authData');

      const parsedAuthenticatorData = parseAuthenticatorData(authData);

      // Check if aaguid (in authData) is 16 zero bytes
      const isAaguidZeroed = parsedAuthenticatorData.aaguid?.every(
        (byte) => byte === 0,
      );

      // If the aaguid in the attested credential data is 16 zero bytes
      // and credentialCreationData.attestationObjectResult.fmt is "packed"
      // and x5c is absent
      const isSelfAttestation =
        isAaguidZeroed && fmt === Fmt.PACKED && !attStmt.has('x5c');

      // then self attestation is being used and no further action is needed.
      if (isSelfAttestation) {
        return attestationObjectResult;
      }

      // Otherwise: Set fmt to "none" and attStmt to empty CBOR map
      attestationObject.set('fmt', Fmt.NONE);
      attestationObject.set('attStmt', new Map<never, never>());

      // Re-encode the modified attestation object
      return new Uint8Array(cbor.encode(attestationObject));
    }

    // If "indirect": The client MAY replace with more privacy-friendly
    // version
    // NOTE: Not implemented - we convey unaltered for indirect
    if (attestationConveyancePreferenceOption === Attestation.INDIRECT) {
      return attestationObjectResult;
    }

    // If "direct" or "enterprise": Convey the authenticator's AAGUID and
    // attestation statement, unaltered
    return attestationObjectResult;
  }

  private _hashCreateCredentialOptionsAsHex(opts: {
    pkOptions: PublicKeyCredentialCreationOptions;
    meta: AuthenticatorAgentMetaArgs;
  }): string {
    const { pkOptions, meta } = opts;

    return Hash.sha256JSONHex({
      pkOptions: PublicKeyCredentialCreationOptionsDtoSchema.encode(pkOptions),
      meta,
    });
  }

  /**
   * Creates a new public key credential (registration ceremony).
   * This implements the agent/client-side steps of the WebAuthn createCredential algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   */
  public async createCredential(
    opts: VirtualAuthenticatorAgentCreateCredentialArgs & {
      prevStateToken?: string;
      nextPartialState?: RegistrationState;
    },
  ): Promise<PublicKeyCredential> {
    const {
      origin,
      options,
      sameOriginWithAncestors,
      meta,
      prevStateToken,
      nextPartialState,
    } = opts;

    const optionsHash = this._hashCreateCredentialOptionsAsHex({
      pkOptions: options.publicKey!,
      meta,
    });

    let registrationPrevState: RegistrationPrevState | undefined = undefined;
    if (prevStateToken !== undefined) {
      const prevState = await this.stateManager.validateToken(prevStateToken);

      assertSchema(prevState, RegistrationPrevStateSchema);

      // State options hash validation
      assertSchema(prevState.optionsHash, z.literal(optionsHash).optional());

      registrationPrevState = prevState;
    }

    const nextState: RegistrationPrevState = registrationPrevState
      ? {
          ...registrationPrevState,
          ...nextPartialState,
        }
      : {
          optionsHash,
        };

    const publicKeyCredential = await this._createCredential({
      origin,
      options,
      sameOriginWithAncestors,
      meta,
      state: nextState,
    });

    return publicKeyCredential;
  }

  /**
   * Creates a new public key credential (registration ceremony).
   * This implements the agent/client-side steps of the WebAuthn createCredential algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   */
  private async _createCredential(
    opts: VirtualAuthenticatorAgentCreateCredentialArgs & {
      state: RegistrationPrevState;
    },
  ): Promise<PublicKeyCredential> {
    const { origin, options, sameOriginWithAncestors, meta, state } = opts;

    // Step 1: Let options be the object passed to the
    // [[Create]](origin, options, sameOriginWithAncestors) internal method.
    // Assert that options.publicKey is present.
    assertSchema(
      options,
      CredentialCreationOptionsSchema.safeExtend({
        publicKey: PublicKeyCredentialCreationOptionsSchema,
      }),
    );

    assertSchema(sameOriginWithAncestors, z.literal(true));

    // Meta validation
    assertSchema(
      meta,
      AuthenticatorAgentMetaArgsSchema.safeExtend({
        userId: z.literal(UUIDMapper.bytesToUUID(options.publicKey.user.id)),
        origin: z.literal(origin),
      }),
    );

    // Step 2: If sameOriginWithAncestors is false, throw a
    // "NotAllowedError" DOMException.
    // If options.signal's aborted flag is set, then throw an
    // "AbortError" DOMException.
    // If options.mediation is present with the value "conditional",
    // throw a "NotSupportedError" DOMException.
    // If the current settings object does not have transient activation,
    // throw a "NotAllowedError" DOMException.
    // NOTE: Browser security checks (sameOriginWithAncestors, mediation,
    // transient activation) are not applicable. This is a backend virtual
    // authenticator for testing where such browser-specific security
    // contexts don't exist.

    // Step 3: Let pkOptions be the value of options.publicKey.
    const pkOptions = options.publicKey;

    // Step 4: If pkOptions.timeout is present, check if its value lies
    // within a reasonable range as defined by the client and if not,
    // correct it to the closest value lying within that range. Set a
    // timer lifetimeTimer to this adjusted value. If pkOptions.timeout is
    // not present, then set lifetimeTimer to a client-specific default.
    // NOTE: Timer value calculated but timeout handling not fully
    // implemented. This is a testing environment where timeouts are
    // typically not desired.
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

    // Step 5: If the length of pkOptions.user.id is not between 1 and
    // 64 bytes (inclusive): Throw a "TypeError" DOMException.
    // NOTE: Handled by schema validation.

    // Step 6: Let callerOrigin be origin. If callerOrigin is an opaque
    // origin, throw a "NotAllowedError" DOMException.
    // NOTE: Opaque origin check not implemented. This is a backend virtual
    // authenticator where origins are provided as explicit input parameters
    // rather than derived from browser context.

    // Step 7: Let effectiveDomain be the callerOrigin's effective domain.
    // If effective domain is not a valid domain, throw a
    // "NotAllowedError" DOMException.
    const effectiveDomain = new URL(meta.origin).hostname;

    // Step 8: If pkOptions.rp.id is not present, then set
    // pkOptions.rp.id to effectiveDomain.
    // If pkOptions.rp.id is not a registrable domain suffix of and is not
    // equal to effectiveDomain, throw a "SecurityError" DOMException.
    const rpId = pkOptions.rp.id ?? effectiveDomain;
    assertSchema(effectiveDomain, createOriginMatchesRpIdSchema(rpId));

    // Step 9: Let credTypesAndPubKeyAlgs be a new list whose items are
    // pairs of PublicKeyCredentialType and a COSEAlgorithmIdentifier.
    const credTypesAndPubKeyAlgs: PubKeyCredParam[] = [];

    // Step 10: For each current of pkOptions.pubKeyCredParams:
    // If pkOptions.pubKeyCredParams's size is zero, then append the
    // following pairs of PublicKeyCredentialType and
    // COSEAlgorithmIdentifier values to credTypesAndPubKeyAlgs:
    // public-key and -7 ("ES256"), public-key and -257 ("RS256").
    if (pkOptions.pubKeyCredParams.length === 0) {
      // Append the following pairs of PublicKeyCredentialType and
      // COSEAlgorithmIdentifier values to credTypesAndPubKeyAlgs:
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
      // Step 10: If pkOptions.pubKeyCredParams's size is non-zero:
      // For each current of pkOptions.pubKeyCredParams:
      // If current.type does not contain a PublicKeyCredentialType
      // supported by this implementation, then continue.
      // Append current to credTypesAndPubKeyAlgs.
      for (const pubKeyCredParam of pkOptions.pubKeyCredParams) {
        // If current.type does not contain a PublicKeyCredentialType
        // supported by this implementation, then continue.
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

    // Step 12: If pkOptions.extensions is present:
    // Process all extension inputs using the ExtensionProcessor
    const { clientExtensions, authenticatorExtensions } =
      await this.extensionProcessor.processInputs({
        extensions: pkOptions.extensions,
        context: {},
        isClientExtension: (extensionId) =>
          Object.values(ClientRegistrationExtension).includes(
            extensionId as ClientRegistrationExtension,
          ),
        isAuthenticatorExtension: (extensionId) =>
          Object.values(AuthenticatorRegistrationExtension).includes(
            extensionId as AuthenticatorRegistrationExtension,
          ),
      });

    // Step 13: Let collectedClientData be a new CollectedClientData
    // instance whose fields are:
    const collectedClientData: CollectedClientData = {
      type: CollectedClientDataType.WEBAUTHN_CREATE,
      challenge: Buffer.from(pkOptions.challenge).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
      topOrigin: meta.crossOrigin ? meta.topOrigin : undefined,
    };

    // Step 14: Let clientDataJSON be the JSON-compatible serialization of
    // collectedClientData.
    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(collectedClientData)),
    );

    // Step 15: Let clientDataHash be the hash of the serialized client
    // data represented by clientDataJSON.
    const clientDataHash = Hash.sha256(clientDataJSON);

    // Step 16: If options.signal is present and its aborted flag is set:
    // Throw a new "AbortError" DOMException and terminate this algorithm.
    if (options.signal?.aborted) {
      throw options.signal.reason;
    }

    // Step 17: Let issuedRequests be a new ordered set.
    // NOTE: Not implemented. This is a single virtual authenticator
    // environment, not a multi-authenticator client platform.

    // Step 18: Let authenticators represent a value which at any given
    // instant is a set of client platform-specific handles, where each item
    // identifies an authenticator presently available on this client
    // platform at that instant.
    // NOTE: Not implemented. This virtual authenticator is always available
    // as the sole authenticator.

    // Step 19: If options.mediation is present with the value conditional:
    // If pkOptions.authenticatorSelection.authenticatorAttachment is
    // present with the value platform, throw a "NotSupportedError"
    // DOMException.
    // Check user consent.
    // If user consent was not granted or pkOptions.pubKeyCredParams is not
    // consistent with the credentials available on this client platform,
    // throw a "NotAllowedError" DOMException.
    // NOTE: Conditional mediation is not applicable to backend virtual
    // authenticators.

    // Step 20: Consider the value of hints and craft the user interface
    // accordingly, as the user-agent sees fit.
    // NOTE: Not implemented. This is a backend virtual authenticator with
    // no user interface.

    // Step 21: Start lifetimeTimer.
    // NOTE: Not implemented.

    // Step 22: While lifetimeTimer has not expired,
    // perform the following actions depending upon lifetimeTimer,
    // and the state and response for each authenticator in authenticators:

    // Step 22.EXPIRATION: If lifetimeTimer expires
    // For each authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator
    // and remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 22.USER_CANCEL: If the user exercises a user agent user-interface option to cancel the process
    // For each authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator
    // and remove authenticator from issuedRequests. Throw a "NotAllowedError" DOMException.
    // NOTE: Not implemented.

    // Step 22.SIGNAL: If options.signal is present and aborted
    // For each authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator
    // and remove authenticator from issuedRequests. Throw a "NotAllowedError" DOMException.
    if (options.signal?.aborted) {
      // NOTE: signal reason is used instead of NotAllowedError
      throw options.signal.reason;
    }

    // Step 22.AVAILABLE: If an authenticator becomes available on this client device

    // Step 22.AVAILABLE.1: This authenticator is now the candidate authenticator.

    // Step 22.AVAILABLE.2.1: If pkOptions.authenticatorSelection.authenticatorAttachment is present and its value is not equal to authenticator’s authenticator attachment modality, continue.
    // @see https://www.w3.org/TR/webauthn-3/#authenticator-attachment-modality
    // NOTE: Not implemented

    // Step 22.AVAILABLE.3.2: If pkOptions.authenticatorSelection.residentKey...
    // NOTE: The Virtual Authenticator always supports client-side discoverable public key credential source
    // @see https://www.w3.org/TR/webauthn-3/#client-side-discoverable-public-key-credential-source

    // Step 22.AVAILABLE.3.3: If pkOptions.authenticatorSelection.userVerification is set to required and the authenticator is not capable of performing user verification, continue.
    // NOTE: The Virtual Authenticator is always capable of performing user verification

    // Step 22.AVAILABLE.3: Let requireResidentKey be the effective resident key requirement for credential creation, a Boolean value, as follows:
    const requireResidentKey = this._calculateEffectiveResidentKeyRequirement({
      authenticatorSelection: pkOptions.authenticatorSelection,
    });

    // Step 22.AVAILABLE.4: Let userVerification be the effective user verification
    // requirement for credential creation, a Boolean value, as follows:
    // If pkOptions.authenticatorSelection.userVerification is set to
    // required, let userVerification be true.
    // If pkOptions.authenticatorSelection.userVerification is set to
    // preferred, let userVerification be true if the authenticator is
    // capable of user verification; otherwise false.
    // If pkOptions.authenticatorSelection.userVerification is set to
    // discouraged (or not present), let userVerification be false.
    const requireUserVerification =
      this._calculateEffectiveUserVerificationRequirement({
        userVerification: pkOptions.authenticatorSelection?.userVerification,
        userVerificationEnabled: meta.userVerificationEnabled !== false,
      });

    // Step 22.AVAILABLE.5: Let enterpriseAttestationPossible be a Boolean value, as
    // follows:
    // If pkOptions.attestation is set to enterprise, let
    // enterpriseAttestationPossible be true if the user agent wishes to
    // support enterprise attestation for pkOptions.rp.id; otherwise false.
    // Otherwise, let enterpriseAttestationPossible be false.
    // NOTE: Virtual authenticator does not support enterprise attestation.
    const enterpriseAttestationPossible = false;

    // Step 22.AVAILABLE.6: Let attestationFormats be a list of strings, initialized
    // to the value of pkOptions.attestationFormats.
    // NOTE: pkOptions.attestationFormats not implemented in schema,
    // initialized below.
    let attestationFormats: string[] = pkOptions.attestationFormats ?? [];

    // Step 22.AVAILABLE.7: If pkOptions.attestation is set to none, set
    // attestationFormats to the single-element list containing the string
    // "none".
    // NOTE: The spec only explicitly handles the NONE case. For DIRECT,
    // INDIRECT, and ENTERPRISE attestation types, this implementation
    // defaults to PACKED format when attestationFormats is empty, which is
    // an implementation decision not specified in the WebAuthn spec.
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

    // Step 22.AVAILABLE.8: Let excludeCredentialDescriptorList be a new list.
    // Step 22.AVAILABLE.9: For each credential descriptor C in
    // pkOptions.excludeCredentials:
    // If C.transports is not empty, and authenticator is connected over a
    // transport not mentioned in C.transports, the client MAY continue.
    // Otherwise, Append C to excludeCredentialDescriptorList.
    // NOTE: Transport filtering not implemented. Virtual authenticator
    // accepts all credential descriptors as it represents a single
    // transport-agnostic authenticator.
    const excludeCredentialDescriptorList = pkOptions.excludeCredentials;

    // Step 22.AVAILABLE.10: Invoke the authenticatorMakeCredential operation on
    // authenticator with clientDataHash, rpEntity, userEntity,
    // requireResidentKey, requireUserPresence, requireUserVerification,
    // credTypesAndPubKeyAlgs, excludeCredentialDescriptorList,
    // enterpriseAttestationPossible, and authenticatorExtensions as
    // parameters.
    const { attestationObject, credentialId } = await this.authenticator
      .authenticatorMakeCredential({
        authenticatorMakeCredentialArgs: {
          hash: clientDataHash,
          rpEntity: {
            name: pkOptions.rp.name,
            id: rpId,
          },
          userEntity: pkOptions.user,
          requireResidentKey,
          requireUserPresence: true,
          requireUserVerification,
          credTypesAndPubKeyAlgs,
          excludeCredentialDescriptorList,
          enterpriseAttestationPossible,
          attestationFormats,
          authenticatorExtensions,
        },
        meta: {
          userId: meta.userId,
          apiKeyId: meta.apiKeyId,
          userPresenceEnabled: meta.userPresenceEnabled,
          userVerificationEnabled: meta.userVerificationEnabled,
        },
        state: state,
      })
      .catch(async (error) => {
        throw await this._mapAuthenticatorErrorToAgentError({
          error,
          prevState: state,
        });
      });

    // Step 22.UNAVAILABLE: If an authenticator ceases to be available on this client device
    // Remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 22.USER_CANCELLATION_STATUS: If any authenticator returns a status indicating that the user cancelled the operation
    // Remove authenticator from issuedRequests.
    // For each remaining authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator and remove it from issuedRequests.
    // NOTE: Not implemented.

    // Step 22.INVALID_STATE_ERROR: If any authenticator returns an error status equivalent to "InvalidStateError"
    // Remove authenticator from issuedRequests.
    // For each remaining authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator and remove it from issuedRequests.
    // Throw an "InvalidStateError" DOMException.
    // NOTE: Not implemented.

    // Step 22.UNKNOWN_ERROR: If any authenticator returns an error status not equivalent to "InvalidStateError"
    // Remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 22.SUCCESS: If any authenticator indicates success, perform the
    // following steps:
    // Remove authenticator from issuedRequests.
    // NOTE: Not implemented. Single virtual authenticator always succeeds or
    // throws, no multi-authenticator coordination needed.

    // Step 22.SUCCESS.1: Let credentialCreationData be a struct with the following fields:
    // attestationObjectResult:
    //    whose value is the bytes returned from the
    //    successful authenticatorMakeCredential operation.
    // clientDataJSONResult:
    //    whose value is the bytes of clientDataJSON.
    // attestationConveyancePreferenceOption:
    //    whose value is the value of pkOptions.attestation.
    // clientExtensionResults:
    //    whose value is an AuthenticationExtensionsClientOutputs object
    //    containing extension identifier -> client extension output entries.
    //    The entries are created by running each extension’s client extension
    //    processing algorithm to create the client extension outputs,
    //    for each client extension in pkOptions.extensions.
    //    @see https://www.w3.org/TR/webauthn-3/#assertioncreationdata-clientextensionresults

    // Process extension outputs using ExtensionProcessor
    const clientExtensionResults = this.extensionProcessor.processOutputs({
      clientExtensions,
      context: { requireResidentKey },
    });

    const credentialCreationData = {
      // attestationObjectResult: whose value is the bytes returned from the successful authenticatorMakeCredential operation.
      attestationObjectResult: attestationObject,
      // clientDataJSONResult: whose value is the bytes of clientDataJSON.
      clientDataJSONResult: clientDataJSON,
      // attestationConveyancePreferenceOption: whose value is the value of pkOptions.attestation.
      attestationConveyancePreferenceOption: pkOptions.attestation,
      // clientExtensionResults: whose value is an AuthenticationExtensionsClientOutputs object
      // containing extension identifier -> client extension output entries.
      // The entries are created by running each extension’s client extension
      // processing algorithm to create the client extension outputs,
      // for each client extension in pkOptions.extensions.
      clientExtensionResults: clientExtensionResults,
    };

    // Step 22.SUCCESS.2: Let constructCredentialAlg be an algorithm that
    // takes a global object global, and whose steps are described in
    // § 5.1.3.1 Create a New Credential - Get the same-origin with its
    // ancestors boolean - Construct the Credential from
    // credentialCreationData.
    const processedAttestationObject = this._constructCredentialAlg({
      attestationConveyancePreferenceOption:
        credentialCreationData.attestationConveyancePreferenceOption,
      attestationObjectResult: credentialCreationData.attestationObjectResult,
    });

    // Step 22.SUCCESS.3: Return the result of running constructCredentialAlg
    // with the current global object.
    const pubKeyCred: PublicKeyCredential = {
      id: Buffer.from(credentialId).toString('base64url'),
      rawId: credentialId,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: clientDataJSON,
        attestationObject: processedAttestationObject,
        transports: [AuthenticatorTransport.INTERNAL],
      },
      // A platform authenticator is attached using a client device-specific transport, called platform attachment, and is usually not removable from the client device.
      // A public key credential bound to a platform authenticator is called a platform credential.

      // A roaming authenticator is attached using cross-platform transports, called cross-platform attachment.
      // Authenticators of this class are removable from, and can "roam" between, client devices.
      // A public key credential bound to a roaming authenticator is called a roaming credential.

      // @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-attachment-modality
      // NOTE: We use 'platform' because this authenticator is software-integrated
      // and communicates directly with the client, acting like a built-in Passkey provider.
      // Portability/Syncing is signaled via the 'Backup Eligible' (BE) flag in
      // authenticatorData, not by setting the attachment to 'cross-platform'.
      authenticatorAttachment: AuthenticatorAttachment.PLATFORM,
      clientExtensionResults: credentialCreationData.clientExtensionResults,
    };

    // Step 22.SUCCESS.5: Return pubKeyCred.
    return pubKeyCred;
  }

  private _hashGetAssertionOptionsAsHex(opts: {
    pkOptions: PublicKeyCredentialRequestOptions;
    meta: AuthenticatorAgentMetaArgs;
  }): string {
    const { pkOptions, meta } = opts;

    return Hash.sha256JSONHex({
      pkOptions: PublicKeyCredentialRequestOptionsDtoSchema.encode(pkOptions),
      meta,
    });
  }

  /**
   * Creates a new public key credential (registration ceremony).
   * This implements the agent/client-side steps of the WebAuthn createCredential algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   */
  public async getAssertion(
    opts: VirtualAuthenticatorAgentGetAssertionArgs & {
      prevStateToken?: string;
      nextPartialState?: AuthenticationState;
    },
  ): Promise<PublicKeyCredential> {
    const {
      origin,
      options,
      sameOriginWithAncestors,
      meta,
      prevStateToken,
      nextPartialState,
    } = opts;

    const optionsHash = this._hashGetAssertionOptionsAsHex({
      pkOptions: options.publicKey!, // Assume validated by caller or schema
      meta,
    });

    let authenticationPrevState: AuthenticationPrevState | undefined =
      undefined;
    if (prevStateToken !== undefined) {
      const prevState = await this.stateManager.validateToken(prevStateToken);

      assertSchema(prevState, AuthenticationPrevStateSchema);

      // State options hash validation
      assertSchema(prevState.optionsHash, z.literal(optionsHash).optional());

      authenticationPrevState = prevState;
    }

    const nextState: AuthenticationPrevState = authenticationPrevState
      ? {
          ...authenticationPrevState,
          ...nextPartialState,
        }
      : {
          optionsHash,
        };

    const publicKeyCredential = await this._getAssertion({
      origin,
      options,
      sameOriginWithAncestors,
      meta,
      state: nextState,
    });

    return publicKeyCredential;
  }

  /**
   * Gets an existing credential (authentication ceremony).
   * This implements the agent/client-side steps of the WebAuthn getAssertion algorithm.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
   */
  private async _getAssertion(
    opts: VirtualAuthenticatorAgentGetAssertionArgs & {
      state: AuthenticationPrevState;
    },
  ): Promise<PublicKeyCredential> {
    const { origin, options, sameOriginWithAncestors, meta, state } = opts;

    // Step 1: Let options be the object passed to the
    // [[DiscoverFromExternalSource]](origin, options,
    // sameOriginWithAncestors) internal method.
    // Assert that options.publicKey is present.
    assertSchema(
      options,
      CredentialRequestOptionsSchema.safeExtend({
        publicKey: PublicKeyCredentialRequestOptionsSchema,
      }),
    );

    assertSchema(sameOriginWithAncestors, z.literal(true));

    // Meta validation
    assertSchema(
      meta,
      AuthenticatorAgentMetaArgsSchema.safeExtend({
        origin: z.literal(origin),
      }),
    );

    // Step 2: Let pkOptions be the value of options.publicKey.
    const pkOptions = options.publicKey;

    let credentialIdFilter: PublicKeyCredentialDescriptor[] = [];
    // Step 3: If options.mediation is present with the value conditional:
    if (options.mediation === CredentialMediationRequirement.CONDITIONAL) {
      // Step 3.1: Let credentialIdFilter be the value of pkOptions.allowCredentials.
      credentialIdFilter = pkOptions.allowCredentials ?? [];

      // Step 3.2: Set pkOptions.allowCredentials to empty.
      // NOTE: Skipped.

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

    // Step 5: Let callerOrigin be origin. If callerOrigin is an opaque
    // origin, throw a "NotAllowedError" DOMException.
    // NOTE: The check for opaque origin is not implemented.
    const callerOrigin = meta.origin;

    // Step 6: Let effectiveDomain be the callerOrigin's effective domain.
    // If effective domain is not a valid domain, then throw a
    // "SecurityError" DOMException.
    // NOTE: The check is not implemented.
    const effectiveDomain = new URL(callerOrigin).hostname;

    // Step 7: If pkOptions.rpId is not present, set pkOptions.rpId to
    // effectiveDomain.
    // If pkOptions.rpId is present: if pkOptions.rpId is not a registrable
    // domain suffix of and is not equal to effectiveDomain, handle related
    // origin requests or throw a "SecurityError" DOMException.
    // NOTE: Related origin requests are not supported. The implementation
    // validates that rpId is a registrable domain suffix of or equal to
    // effectiveDomain.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion (step 7)
    const rpId = pkOptions.rpId ?? effectiveDomain;
    assertSchema(effectiveDomain, createOriginMatchesRpIdSchema(rpId));

    // Step 8: Let clientExtensions be a new map and let
    // authenticatorExtensions be a new map.
    // Step 9: If pkOptions.extensions is present:
    // Process all extension inputs using the ExtensionProcessor
    const { clientExtensions, authenticatorExtensions } =
      await this.extensionProcessor.processInputs({
        extensions: pkOptions.extensions,
        context: {},
        isClientExtension: (extensionId) =>
          Object.values(ClientAuthenticationExtension).includes(
            extensionId as ClientAuthenticationExtension,
          ),
        isAuthenticatorExtension: (extensionId) =>
          Object.values(AuthenticatorAuthenticationExtension).includes(
            extensionId as AuthenticatorAuthenticationExtension,
          ),
      });

    // Step 10: Let collectedClientData be a new CollectedClientData
    // instance whose fields are:
    const collectedClientData: CollectedClientData = {
      type: CollectedClientDataType.WEBAUTHN_GET,
      challenge: Buffer.from(pkOptions.challenge).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
      topOrigin: meta.crossOrigin ? meta.topOrigin : undefined,
    };

    // Step 11: Let clientDataJSON be the JSON-compatible serialization of
    // client data constructed from collectedClientData.
    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(collectedClientData)),
    );

    // Step 12: Let clientDataHash be the hash of the serialized client data
    // represented by clientDataJSON.
    const clientDataHash = Hash.sha256(clientDataJSON);

    // Step 13: If options.signal is present and aborted, throw the
    // options.signal's abort reason.
    if (options.signal?.aborted) {
      throw options.signal.reason;
    }

    // Step 14: Let issuedRequests be a new ordered set.
    // NOTE: Not implemented.

    // Step 15: Let savedCredentialIds be a new map.
    // NOTE: Not implemened.

    // Step 16: Let authenticators represent a value which at any given
    // instant is a set of client platform-specific handles, where each item
    // identifies an authenticator presently available on this client
    // platform at that instant.
    // NOTE: Not implemented.

    // Step 17: Let silentlyDiscoveredCredentials be a new map whose entries
    // are of the form: DiscoverableCredentialMetadata -> authenticator.
    // NOTE: Not implemented.

    // Step 18: Consider the value of hints and craft the user interface
    // accordingly, as the user-agent sees fit.
    // NOTE: Not implemented.

    // Step 19: Start lifetimeTimer.
    // NOTE: Not implemented.

    // Step 20: While lifetimeTimer has not expired, for each authenticator
    // in authenticators, perform the following actions depending upon
    // lifetimeTimer, and the state and response for each authenticator in
    // authenticators:

    // Step 20.EXPIRATION: If lifetimeTimer expires
    // For each authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator and remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.USER_CANCEL: If the user exercises a user agent user-interface option to cancel the process
    // For each authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator
    // and remove authenticator from issuedRequests. Throw a "NotAllowedError" DOMException.
    // NOTE: Not implemented.

    // Step 20.SIGNAL: If options.signal is present and aborted
    // For each authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator
    // and remove authenticator from issuedRequests.
    // Then throw the options.signal’s abort reason.
    if (options.signal?.aborted) {
      throw options.signal.reason;
    }

    // Step 20.USER_INTERACTION: If options.mediation is conditional
    // and the user interacts with an input or textarea form control with an autocomplete attribute whose non-autofill credential type is "webauthn"
    // NOTE: Not implemented.

    // Step 20.NO_AUTHENTICATOR_AVAILABLE: If options.mediation is not conditional, issuedRequests is empty,
    // pkOptions.allowCredentials is not empty, and no authenticator will become available for any public key credentials therein:
    // Indicate to the user that no eligible credential could be found. When the user acknowledges the dialog, throw a "NotAllowedError" DOMException.
    // NOTE: Not implemented.

    // Step 20.AVAILABLE: If an authenticator becomes available on this client device

    // Step 20.AVAILABLE.1: If options.mediation is conditional and the authenticator supports the silentCredentialDiscovery operation:
    // NOTE: Not Implemented.

    // Step 20.AVAILABLE.2: Else:

    // Step 20.AVAILABLE.2.1: Execute the `issuing a credential request to an authenticator algorithm` with authenticator, savedCredentialIds, pkOptions, rpId, clientDataHash, and authenticatorExtensions.
    const { credentialId, authenticatorData, signature, userHandle } =
      await this._issueCredentialRequestToAuthenticator({
        authenticator: this.authenticator,
        // NOTE: Not used. Just for compatibility with spec.
        savedCredentialIds: undefined,
        pkOptions,
        rpId,
        clientDataHash,
        authenticatorExtensions: authenticatorExtensions,

        // Custom options
        meta,
        state: state,
      });

    // Step 20.AVAILABLE.2.1: If this returns false, continue.
    // Not implemented as we have single authenticator.

    // Step 20.AVAILABLE.2.2: Append authenticator to issuedRequests.
    // Not implemented as we have single authenticator.

    // Step 20.UNAVAILABLE: If an authenticator ceases to be available on this client device,
    // Remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.USER_CANCELLATION_STATUS: If any authenticator returns a status indicating that the user cancelled the operation,
    // Remove authenticator from issuedRequests.
    // For each remaining authenticator in issuedRequests invoke the authenticatorCancel operation on authenticator and remove it from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.UNKNOWN_ERROR:
    // Remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.SUCCESS: If any authenticator indicates success, perform the
    // following steps:
    // Remove authenticator from issuedRequests.
    // NOTE: Not implemented.

    // Process extension outputs using ExtensionProcessor
    const clientExtensionResults = this.extensionProcessor.processOutputs({
      clientExtensions,
      context: {},
    });

    // Step 20.SUCCESS.1: Let assertionCreationData be a struct with the following fields:
    // credentialIdResult:
    //    whose value is the bytes of savedCredentialIds[authenticator]
    //    if it exists, otherwise the bytes of the credential ID returned
    //    from the successful authenticatorGetAssertion operation.
    // clientDataJSONResult:
    //    whose value is the bytes of clientDataJSON.
    // authenticatorDataResult:
    //    whose value is the bytes of the authenticator data returned by the authenticator.
    // signatureResult:
    //    whose value is the bytes of the signature value returned by the authenticator.
    // userHandleResult:
    //    whose value is the bytes of the returned user handle if the
    //    authenticator returned one, otherwise null.
    // clientExtensionResults:
    //    whose value is an AuthenticationExtensionsClientOutputs object
    //    containing extension identifier -> client extension output entries.
    //    The entries are created by running each extension’s client extension
    //    processing algorithm to create the client extension outputs,
    //    for each client extension in pkOptions.extensions.
    //    @see https://www.w3.org/TR/webauthn-3/#assertioncreationdata-clientextensionresults
    const assertionCreationData = {
      // credentialIdResult: If savedCredentialIds[authenticator] exists, set the value of credentialIdResult to be the bytes of savedCredentialIds[authenticator]. Otherwise, set the value of credentialIdResult to be the bytes of the credential ID returned from the successful authenticatorGetAssertion operation, as defined in §6.3.3 The authenticatorGetAssertion Operation.
      credentialIdResult: credentialId,
      // clientDataJSONResult: whose value is the bytes of clientDataJSON.
      clientDataJSONResult: clientDataJSON,
      // authenticatorDataResult: whose value is the bytes of the authenticator data returned by the authenticator.
      authenticatorDataResult: authenticatorData,
      // signatureResult: whose value is the bytes of the signature value returned by the authenticator.
      signatureResult: signature,
      // userHandleResult: If the authenticator returned a user handle, set the value of userHandleResult to be the bytes of the returned user handle. Otherwise, set the value of userHandleResult to null.
      userHandleResult: userHandle,
      // clientExtensionResults: whose value is an AuthenticationExtensionsClientOutputs object containing extension identifier -> client extension output entries. The entries are created by running each extension’s client extension processing algorithm to create the client extension outputs, for each client extension in pkOptions.extensions.
      clientExtensionResults: clientExtensionResults,
    };

    // Step 20.SUCCESS.2: If credentialIdFilter is not empty and
    // credentialIdFilter does not contain an item whose id's value is set to
    // the value of credentialIdResult, continue.

    if (credentialIdFilter?.length > 0) {
      const containsCredentialId = credentialIdFilter.find(
        (credentialIdFilterItem) =>
          credentialIdFilterItem.id ===
          assertionCreationData.credentialIdResult,
      );

      if (containsCredentialId === undefined) {
        // continue.
        throw new CredentialNotFound();
      }
    }

    // Step 20.SUCCESS.3: If credentialIdFilter is empty and userHandleResult
    // is null, continue.
    if (
      credentialIdFilter.length === 0 &&
      assertionCreationData.userHandleResult === null
    ) {
      // continue.
      throw new CredentialNotFound();
    }

    // Step 20.SUCCESS.4: Let settings be the current settings object. Let
    // global be settings' global object.
    // NOTE: Not implemented.

    // Step 20.SUCCESS.5: Let constructAssertionAlg be an algorithm that
    // takes a global object global and whose steps are described in
    // § 5.1.4.1 Use an Existing Credential to Make an Assertion - Get the
    // same-origin with its ancestors boolean - Construct the Credential from
    // assertionCreationData.

    // Step 20.SUCCESS.6: Return the result of running constructAssertionAlg
    // with the current global object.
    const pubKeyCred: PublicKeyCredential = {
      id: Buffer.from(assertionCreationData.credentialIdResult).toString(
        'base64url',
      ),
      rawId: assertionCreationData.credentialIdResult,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData,
        signature,
        userHandle,
      },
      // A platform authenticator is attached using a client device-specific transport, called platform attachment, and is usually not removable from the client device.
      // A public key credential bound to a platform authenticator is called a platform credential.

      // A roaming authenticator is attached using cross-platform transports, called cross-platform attachment.
      // Authenticators of this class are removable from, and can "roam" between, client devices.
      // A public key credential bound to a roaming authenticator is called a roaming credential.

      // @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-attachment-modality
      // NOTE: We use 'platform' because this authenticator is software-integrated
      // and communicates directly with the client, acting like a built-in Passkey provider.
      // Portability/Syncing is signaled via the 'Backup Eligible' (BE) flag in
      // authenticatorData, not by setting the attachment to 'cross-platform'.
      authenticatorAttachment: AuthenticatorAttachment.PLATFORM,
      clientExtensionResults: assertionCreationData.clientExtensionResults,
    };

    // Step 20.SUCCESS.7: For each remaining authenticator in issuedRequests
    // invoke the authenticatorCancel operation on authenticator and remove it
    // from issuedRequests.
    // NOTE: Not implemented.

    // Step 20.SUCCESS.8: Return pubKeyCred and terminate this algorithm.
    return pubKeyCred;
  }
}
