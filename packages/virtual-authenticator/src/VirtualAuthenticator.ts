import {
  AuthenticatorTransport,
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/enums';
import { COSEKey } from '@repo/keys';
import type { CredentialSigner } from '@repo/types';
import { bytesNotEmpty, hasBytes, hasMinBytes } from '@repo/utils';
import { sha256 } from '@repo/utils';
import type {
  CollectedClientData,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialRequestOptions,
  PublicKeyCredential,
} from '@repo/validation';
import * as cbor from 'cbor';
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
  isString,
} from 'typanion';

export class VirtualAuthenticator {
  // The AAGUID of the authenticator.
  // Length (in bytes): 16
  // Zeroed-out AAGUID
  static readonly AAGUID = Buffer.alloc(16);

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
   */
  private async _createAttestedCredentialData(opts: {
    credentialID: Buffer;
    COSEPublicKey: COSEKey;
  }): Promise<Buffer> {
    const { credentialID, COSEPublicKey } = opts;

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
    const credentialPublicKeyBuffer = COSEPublicKey.toBuffer();

    // https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
    // Attested credential data is a variable-length byte array added to the
    // authenticator data when generating an attestation object for a given credential.
    const attestedCredentialData = Buffer.concat([
      VirtualAuthenticator.AAGUID,
      credentialIdLength,
      credentialID,
      credentialPublicKeyBuffer,
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
    COSEPublicKey: COSEKey;
  }): Promise<Buffer> {
    const { rpId, counter, credentialID, COSEPublicKey } = opts;

    // SHA-256 hash of the RP ID the credential is scoped to.
    // Length (in bytes): 32
    const rpIdHash = sha256(Buffer.from(rpId));

    // Bit 0 (UP - User Present): Result of the user presence test (1 = present, 0 = not present).
    // Bit 1 (RFU1): Reserved for future use.
    // Bit 2 (UV - User Verified): Result of the user verification test (1 = verified, 0 = not verified).
    // Bits 3-5 (RFU2): Reserved for future use.
    // Bit 6 (AT - Attested Credential Data Included): Indicates if attested credential data is included.
    // Bit 7 (ED - Extension data included): Indicates if extension data is included in the authenticator data.
    // Length (in bytes): 1
    const flags = Buffer.from([(credentialID ? 0b01000000 : 0) | 0b00000101]);

    // Signature counter, 32-bit unsigned big-endian integer.
    // Length (in bytes): 4
    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(counter, 0);

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authenticatorData = Buffer.concat(
      [
        rpIdHash,
        flags,
        signCountBuffer,
        credentialID
          ? await this._createAttestedCredentialData({
              credentialID,
              COSEPublicKey,
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
  public async getCredential(opts: {
    publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
    COSEPublicKey: COSEKey;
    credentialSigner: CredentialSigner;
    meta: {
      counter: number;
      /**
       * 1. At least 16 bytes that include at least 100 bits of entropy, or
       * 2. The public key credential source, without its Credential ID or mutable items,
       * encrypted so only its managing authenticator can decrypt it.
       * This form allows the authenticator to be nearly stateless,
       * by having the Relying Party store any necessary state.
       *
       * Length (in bytes): L
       *
       * @see https://www.w3.org/TR/webauthn-2/#credential-id
       */
      credentialID: Buffer;
    };
  }): Promise<PublicKeyCredential> {
    const {
      publicKeyCredentialRequestOptions,
      COSEPublicKey,
      credentialSigner,
      meta,
    } = opts;

    assert(meta.counter, isNumber());
    assert(meta.credentialID, applyCascade(isInstanceOf(Buffer), hasBytes(16)));

    assert(publicKeyCredentialRequestOptions.rpId, isString());
    assert(
      publicKeyCredentialRequestOptions.allowCredentials,
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
      publicKeyCredentialRequestOptions.challenge,
      applyCascade(isInstanceOf(Buffer), hasMinBytes(16)),
    );
    assert(
      publicKeyCredentialRequestOptions.userVerification,
      isOptional(isEnum(Object.values(UserVerificationRequirement))),
    );

    const clientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge:
        publicKeyCredentialRequestOptions.challenge.toString('base64url'),
      origin: publicKeyCredentialRequestOptions.rpId,
      crossOrigin: false,
    };

    const clientDataJSON = Buffer.from(JSON.stringify(clientData));
    const clientDataHash = sha256(clientDataJSON);

    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialRequestOptions.rpId,
      counter: meta.counter,
      COSEPublicKey,
    });

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    const signature = await credentialSigner.sign(dataToSign);

    return {
      id: meta.credentialID.toString('base64url'),
      rawId: meta.credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData: authData,
        signature: Buffer.from(signature),
        userHandle: null,
      },
      clientExtensionResults: {},
    };
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation
   */
  public async createCredential(opts: {
    publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions;
    COSEPublicKey: COSEKey;
    meta: {
      /**
       * 1. At least 16 bytes that include at least 100 bits of entropy, or
       * 2. The public key credential source, without its Credential ID or mutable items,
       * encrypted so only its managing authenticator can decrypt it.
       * This form allows the authenticator to be nearly stateless,
       * by having the Relying Party store any necessary state.
       *
       * Length (in bytes): L
       *
       * @see https://www.w3.org/TR/webauthn-2/#credential-id
       */
      credentialID: Buffer;
    };
  }): Promise<PublicKeyCredential> {
    const { publicKeyCredentialCreationOptions, COSEPublicKey, meta } = opts;

    assert(meta.credentialID, applyCascade(isInstanceOf(Buffer), hasBytes(16)));

    assert(publicKeyCredentialCreationOptions.rp.id, isString());
    assert(
      publicKeyCredentialCreationOptions.attestation,
      isOptional(isEnum(['none'])),
    );
    assert(
      publicKeyCredentialCreationOptions.challenge,
      applyCascade(isInstanceOf(Buffer), hasMinBytes(16)),
    );
    assert(publicKeyCredentialCreationOptions.user.id, isInstanceOf(Buffer));
    assert(
      publicKeyCredentialCreationOptions.user.id,
      applyCascade(isInstanceOf(Buffer), bytesNotEmpty()),
    );
    assert(
      publicKeyCredentialCreationOptions.pubKeyCredParams,
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

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialCreationOptions.rp.id,
      credentialID: meta.credentialID,
      counter: 0,
      COSEPublicKey,
    });

    const attestationObject = new Map<string, unknown>([
      ['fmt', fmt],
      ['attStmt', attStmt],
      ['authData', authData],
    ]);

    const clientData: CollectedClientData = {
      type: 'webauthn.create',
      challenge:
        publicKeyCredentialCreationOptions.challenge.toString('base64url'),
      origin: publicKeyCredentialCreationOptions.rp.id,
      crossOrigin: false,
    };

    return {
      id: meta.credentialID.toString('base64url'),
      rawId: meta.credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: Buffer.from(JSON.stringify(clientData)),
        attestationObject: cbor.encode(attestationObject),
      },
      clientExtensionResults: {},
    };
  }
}
