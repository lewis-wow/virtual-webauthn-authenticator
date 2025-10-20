import {
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/enums';
import { COSEKey } from '@repo/keys';
import type {
  IAuthenticatorAssertionResponse,
  IAuthenticatorAttestationResponse,
  ICollectedClientData,
  ICredentialPublicKey,
  ICredentialSigner,
  IPublicKeyCredentialCreationOptions,
  IPublicKeyCredentialRequestOptions,
} from '@repo/types';
import { sha256 } from '@repo/utils/sha256';
import { toBuffer } from '@repo/utils/toBuffer';
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
import { PublicKeyCredential } from './PublicKeyCredential.js';

export type VirtualAuthenticatorOptions = {
  credentialSigner: ICredentialSigner;
  credentialPublicKey: ICredentialPublicKey;
};

export class VirtualAuthenticator {
  private readonly credentialSigner: ICredentialSigner;
  private readonly credentialPublicKey: ICredentialPublicKey;
  private _counter = 0;

  constructor(opts: VirtualAuthenticatorOptions) {
    this.credentialSigner = opts.credentialSigner;
    this.credentialPublicKey = opts.credentialPublicKey;
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
    const credentialPublicKey = COSEKey.fromJwk(
      await this.credentialPublicKey.getJwk(),
    ).toBuffer();

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
    const rpIdHash = sha256(toBuffer(opts.rpId));

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
    options: IPublicKeyCredentialRequestOptions,
  ): Promise<PublicKeyCredential<IAuthenticatorAssertionResponse>> {
    assert(options.rpId, isString());
    assert(
      options.allowCredentials,
      applyCascade(
        isArray(
          isPartial({
            id: isInstanceOf(Buffer),
            type: isEnum(PublicKeyCredentialType),
          }),
        ),
        hasMinLength(1),
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

    // A real authenticator would search its storage for a private key corresponding to one
    // of the provided credential IDs. Since this virtual authenticator only manages one
    // key pair at a time, we assume the first allowed credential is the one it "owns".
    const credentialDescriptor = options.allowCredentials[0]!;
    const credentialID = toBuffer(credentialDescriptor.id);

    const clientData: ICollectedClientData = {
      type: 'webauthn.get',
      challenge: toBuffer(options.challenge).toString('base64url'),
      origin: options.rpId,
      crossOrigin: false,
    };

    const clientDataJSON = Buffer.from(JSON.stringify(clientData));
    const clientDataHash = sha256(clientDataJSON);

    this._counter += 1;
    const authData = await this._createAuthenticatorData({
      rpId,
      counter: this._counter,
    });

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    const signature = await this.credentialSigner.sign(dataToSign);

    return new PublicKeyCredential({
      id: toBuffer(credentialID).toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData: authData,
        signature,
        userHandle: null,
      },
      clientExtensionResults: {},
    });
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation
   */
  public async createCredential(
    options: IPublicKeyCredentialCreationOptions,
  ): Promise<PublicKeyCredential<IAuthenticatorAttestationResponse>> {
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

    this._counter = 0;
    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authData = await this._createAuthenticatorData({
      rpId: options.rp.id,
      credentialID,
      counter: this._counter,
    });

    const attestationObject = new Map<string, unknown>([
      ['fmt', fmt],
      ['attStmt', attStmt],
      ['authData', authData],
    ]);

    const clientData: ICollectedClientData = {
      type: 'webauthn.create',
      challenge: toBuffer(options.challenge).toString('base64url'),
      origin: options.rp.id,
      crossOrigin: false,
    };

    return new PublicKeyCredential({
      id: credentialID.toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: Buffer.from(JSON.stringify(clientData)),
        attestationObject: encode(attestationObject),
      },
      clientExtensionResults: {},
    });
  }
}
