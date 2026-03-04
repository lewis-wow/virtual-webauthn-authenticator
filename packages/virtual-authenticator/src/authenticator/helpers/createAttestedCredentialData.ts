import type { Uint8Array_ } from '@repo/types';

export type CreateAttestedCredentialDataArgs = {
  credentialId: Uint8Array_;
  COSEPublicKey: Uint8Array_;
  aaguid: Uint8Array_;
};

/**
 * Creates attested credential data structure.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
 */
export const createAttestedCredentialData = async (
  opts: CreateAttestedCredentialDataArgs,
): Promise<Uint8Array_> => {
  const { credentialId, COSEPublicKey, aaguid } = opts;

  // Byte length L of Credential ID, 16-bit unsigned big-endian integer.
  // Length (in bytes): 2
  const credentialIdLength = Buffer.alloc(2);
  credentialIdLength.writeUInt16BE(opts.credentialId.length, 0);

  // Attested credential data: variable-length byte array for attestation object.
  // @see https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
  const attestedCredentialData = Buffer.concat([
    aaguid,
    credentialIdLength,
    credentialId,
    // The credential public key encoded in COSEKey format, as defined using the CTAP2 canonical CBOR encoding form.
    // The COSEKey-encoded credential public key MUST contain the "alg" parameter
    // and MUST NOT contain any other OPTIONAL parameters.
    // The "alg" parameter MUST contain a COSEAlgorithm value.
    // The encoded credential public key MUST also contain any
    // additional REQUIRED parameters
    // stipulated by the relevant key type specification, i.e., REQUIRED for the key type "kty" and algorithm "alg" (see Section 8 of https://datatracker.ietf.org/doc/html/rfc8152).
    // Length (in bytes): L
    COSEPublicKey,
  ]);

  return new Uint8Array(attestedCredentialData);
};
