import type { TypedMap } from '@repo/types';

/**
 * Attestation Statement structure as defined in WebAuthn specification.
 * @see https://www.w3.org/TR/webauthn-3/#attestation-statement
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAttestationStatementMap
  extends TypedMap<{
    // Common fields (used in "packed", "tpm", "android-key", "apple")

    /**
     * A COSEAlgorithmIdentifier containing the identifier of the algorithm used to generate the attestation signature.
     * @see https://www.w3.org/TR/webauthn-3/#sctn-packed-attestation
     * @see https://www.w3.org/TR/webauthn-3/#sctn-tpm-attestation
     */
    alg: number | undefined;

    /**
     * - https://www.w3.org/TR/webauthn-3/#sctn-packed-attestation:
     * A byte string containing the attestation signature.
     *
     * - https://www.w3.org/TR/webauthn-3/#sctn-tpm-attestation:
     * The attestation signature, in the form of a TPMT_SIGNATURE structure as specified in https://www.w3.org/TR/webauthn-3/#biblio-tpmv2-part2 section 11.3.4.
     */
    sig: Uint8Array | undefined;

    /**
     * - https://www.w3.org/TR/webauthn-3/#sctn-packed-attestation:
     * The elements of this array contain attestnCert and its certificate chain (if any),
     * each encoded in X.509 format.
     * The attestation certificate attestnCert MUST be the first element in the array.
     * - attestnCert: The attestation certificate, encoded in X.509 format.
     *
     * - https://www.w3.org/TR/webauthn-3/#sctn-tpm-attestation:
     * aikCert followed by its certificate chain, in X.509 encoding.
     * - aikCert: The AIK certificate used for the attestation, in X.509 encoding.
     */
    x5c: Uint8Array[] | undefined;

    // Fields specific to "tpm" format

    /**
     * - https://www.w3.org/TR/webauthn-3/#sctn-tpm-attestation:
     * The version of the TPM specification to which the signature conforms.
     *
     * - https://www.w3.org/TR/webauthn-3/#sctn-android-safetynet-attestation:
     * The version number of Google Play Services responsible for providing the SafetyNet API.
     */
    ver: string | undefined;

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-tpm-attestation
     *
     * The TPMS_ATTEST structure over which the above signature was computed, as specified in https://www.w3.org/TR/webauthn-3/#biblio-tpmv2-part2 section 10.12.8.
     */
    certInfo: Uint8Array | undefined;

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-tpm-attestation
     *
     * The TPMT_PUBLIC structure (see https://www.w3.org/TR/webauthn-3/#biblio-tpmv2-part2 section 12.2.4) used by the TPM to represent the credential public key.
     */
    pubArea: Uint8Array | undefined;

    // Fields specific to "android-safetynet" format

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-android-safetynet-attestation
     *
     * JSON Web Signature (JWS) string as bytes
     */
    response: Uint8Array | undefined;
  }> {}
