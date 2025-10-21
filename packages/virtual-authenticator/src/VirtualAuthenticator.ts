import {
  AuthenticatorTransport,
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/enums';
import { COSEKey } from '@repo/keys';
import { sha256 } from '@repo/utils/sha256';
import type {
  CollectedClientData,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialRequestOptions,
  PublicKeyCredential,
} from '@repo/validation';
import { encode } from 'cbor';
import { randomBytes } from 'crypto';
import {
  applyCascade,
  assert,
  hasMinLength,
  isArray,
  isEnum,
  isInstanceOf,
  isNumber,
  isObject,
  isOptional,
  isPartial,
  isString,
} from 'typanion';

import { hasMinBytes } from '../../utils/src/asserts/hasMinBytes.js';
import type { CredentialDiscovery } from './CredentialDiscovery.js';
import type { CredentialSigner } from './types/CredentialSigner.js';

export type VirtualAuthenticatorOptions = {
  credentialSigner: CredentialSigner;
  credentialPublicKey: COSEKey;
  credentialDiscovery: CredentialDiscovery;
};

export class VirtualAuthenticator {
  private readonly credentialSigner: CredentialSigner;
  private readonly credentialPublicKey: COSEKey;
  private readonly credentialDiscovery: CredentialDiscovery;

  constructor(opts: VirtualAuthenticatorOptions) {
    this.credentialSigner = opts.credentialSigner;
    this.credentialPublicKey = opts.credentialPublicKey;
    this.credentialDiscovery = opts.credentialDiscovery;
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#credential-id
   */
  private _createCredentialId(): Buffer {
    // https://www.w3.org/TR/webauthn-2/#credential-id
    // 1. At least 16 bytes that include at least 100 bits of entropy, or
    // 2. The public key credential source, without its Credential ID or mutable items,
    //    encrypted so only its managing authenticator can decrypt it.
    //    This form allows the authenticator to be nearly stateless,
    //    by having the Relying Party store any necessary state.
    // Length (in bytes): L
    return randomBytes(32);
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
   */
  private async _createAttestedCredentialData(opts: {
    credentialID: Buffer;
  }): Promise<Buffer> {
    // The AAGUID of the authenticator.
    // Length (in bytes): 16
    // Zeroed-out AAGUID
    const aaguid = Buffer.alloc(16);

    // Byte length L of Credential ID, 16-bit unsigned big-endian integer.
    // Length (in bytes): 2
    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(opts.credentialID.length, 0);

    // The credential public key encoded in COSE_Key format, as defined in Section 7 of [RFC8152],
    // using the CTAP2 canonical CBOR encoding form.
    // The COSE_Key-encoded credential public key MUST contain the "alg" parameter
    // and MUST NOT contain any other OPTIONAL parameters.
    // The "alg" parameter MUST contain a COSEAlgorithm value.
    // The encoded credential public key MUST also contain any additional REQUIRED parameters
    // stipulated by the relevant key type specification, i.e., REQUIRED for the key type "kty"
    // and algorithm "alg" (see Section 8 of [RFC8152]).
    // Length (in bytes): {variable}
    const credentialPublicKey = this.credentialPublicKey.toBuffer();

    // https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
    // Attested credential data is a variable-length byte array added to the
    // authenticator data when generating an attestation object for a given credential.
    const attestedCredentialData = Buffer.concat([
      aaguid,
      credentialIdLength,
      opts.credentialID,
      credentialPublicKey,
    ]);

    return attestedCredentialData;
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
   */
  private async _createAuthenticatorData(opts: {
    rpId: string;
    counter: number;
    credentialID?: Buffer;
  }): Promise<Buffer> {
    // SHA-256 hash of the RP ID the credential is scoped to.
    // Length (in bytes): 32
    const rpIdHash = sha256(Buffer.from(opts.rpId));

    // Bit 0 (UP - User Present): Result of the user presence test (1 = present, 0 = not present).
    // Bit 1 (RFU1): Reserved for future use.
    // Bit 2 (UV - User Verified): Result of the user verification test (1 = verified, 0 = not verified).
    // Bits 3-5 (RFU2): Reserved for future use.
    // Bit 6 (AT - Attested Credential Data Included): Indicates if attested credential data is included.
    // Bit 7 (ED - Extension data included): Indicates if extension data is included in the authenticator data.
    // Length (in bytes): 1
    const flags = Buffer.from([
      (opts.credentialID ? 0b01000000 : 0) | 0b00000101,
    ]);

    // Signature counter, 32-bit unsigned big-endian integer.
    // Length (in bytes): 4
    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(opts.counter, 0);

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authenticatorData = Buffer.concat(
      [
        rpIdHash,
        flags,
        signCountBuffer,
        opts.credentialID
          ? await this._createAttestedCredentialData({
              credentialID: opts.credentialID,
            })
          : undefined,
        // --- OPTIONAL CREDENTIALS --- (
        //    Extension-defined authenticator data.
        //    This is a CBOR [RFC8949] map with extension identifiers as keys,
        //    and authenticator extension outputs as values.
        //    https://www.w3.org/TR/webauthn-2/#sctn-extensions
        // )
      ].filter((value) => value !== undefined),
    );

    return authenticatorData;
  }

  /**
   * @see https://www.w3.org/TR/webauthn-2/#sctn-credential-assertion
   */
  public async getCredential(
    options: PublicKeyCredentialRequestOptions,
  ): Promise<PublicKeyCredential> {
    assert(options.rpId, isString());
    assert(
      options.allowCredentials,
      isOptional(
        isArray(
          isObject({
            id: isInstanceOf(Buffer),
            type: isEnum(PublicKeyCredentialType),
            transports: isOptional(isArray(isEnum(AuthenticatorTransport))),
          }),
        ),
      ),
    );
    assert(
      options.challenge,
      applyCascade(isInstanceOf(Buffer), hasMinBytes(16)),
    );
    assert(
      options.userVerification,
      isOptional(isEnum(Object.values(UserVerificationRequirement))),
    );

    const rpId = options.rpId;

    const { counter, credentialIDbase64url } =
      await this.credentialDiscovery.selectCredentialAndUpdateCounter(options);

    const clientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge: options.challenge.toString('base64url'),
      origin: options.rpId,
      crossOrigin: false,
    };

    const clientDataJSON = Buffer.from(JSON.stringify(clientData));
    const clientDataHash = sha256(clientDataJSON);

    const authData = await this._createAuthenticatorData({
      rpId,
      counter,
    });

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    const signature = await this.credentialSigner.sign(dataToSign);

    return {
      id: credentialIDbase64url,
      rawId: Buffer.from(credentialIDbase64url, 'base64url'),
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData: authData,
        signature,
        userHandle: null,
      },
      clientExtensionResults: {},
    };
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation
   */
  public async createCredential(
    options: PublicKeyCredentialCreationOptions,
  ): Promise<PublicKeyCredential> {
    assert(options.rp.id, isString());
    assert(options.attestation, isOptional(isEnum(['none'])));
    assert(
      options.challenge,
      applyCascade(isInstanceOf(Buffer), hasMinBytes(16)),
    );
    assert(options.user, isPartial({ id: isInstanceOf(Buffer) }));
    assert(options.user.id, applyCascade(isInstanceOf(Buffer), hasMinBytes(1)));
    assert(
      options.pubKeyCredParams,
      applyCascade(
        isArray(
          isObject({
            type: isEnum(PublicKeyCredentialType),
            alg: isNumber(),
          }),
        ),
        hasMinLength(1),
      ),
    );

    //  If credentialCreationData.attestationConveyancePreferenceOption’s value is "none"
    //  1. Replace potentially uniquely identifying information with non-identifying versions of the same:
    //      If the AAGUID in the attested credential data is 16 zero bytes,
    //      credentialCreationData.attestationObjectResult.fmt is "packed",
    //      and "x5c" is absent from credentialCreationData.attestationObjectResult,
    //      then self attestation is being used and no further action is needed.
    //  2. Otherwise
    //      Replace the AAGUID in the attested credential data with 16 zero bytes.
    //      Set the value of credentialCreationData.attestationObjectResult.fmt to "none",
    //      and set the value of credentialCreationData.attestationObjectResult.attStmt
    //      to be an empty CBOR map.
    // https://www.w3.org/TR/webauthn-2/#sctn-attstn-fmt-ids
    const fmt = 'none';

    // https://www.w3.org/TR/webauthn-2/#attestation-statement
    const attStmt = new Map<string, never>([]);

    const credentialID = this._createCredentialId();

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authData = await this._createAuthenticatorData({
      rpId: options.rp.id,
      credentialID,
      counter: 0,
    });

    const attestationObject = new Map<string, unknown>([
      ['fmt', fmt],
      ['attStmt', attStmt],
      ['authData', authData],
    ]);

    const clientData: CollectedClientData = {
      type: 'webauthn.create',
      challenge: options.challenge.toString('base64url'),
      origin: options.rp.id,
      crossOrigin: false,
    };

    return {
      id: credentialID.toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: Buffer.from(JSON.stringify(clientData)),
        attestationObject: encode(attestationObject),
      },
      clientExtensionResults: {},
    };
  }
}
