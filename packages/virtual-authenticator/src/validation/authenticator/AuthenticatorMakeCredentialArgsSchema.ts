import z from 'zod';

import { see } from '../../meta/see';
import { BytesSchema } from '../BytesSchema';
import { PublicKeyCredentialDescriptorSchema } from '../spec/PublicKeyCredentialDescriptorSchema';
import { PublicKeyCredentialParametersSchema } from '../spec/PublicKeyCredentialParametersSchema';
import { PublicKeyCredentialRpEntitySchema } from '../spec/PublicKeyCredentialRpEntitySchema';
import { PublicKeyCredentialUserEntitySchema } from '../spec/PublicKeyCredentialUserEntitySchema';

/**
 * Zod schema for authenticatorMakeCredential operation input parameters.
 *
 * This schema validates the parameters passed to the authenticator's credential
 * creation operation as defined in the WebAuthn Level 3 specification.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorMakeCredential
 *
 * NOTE: This object is using the WebAuthn specification defintion.
 * The CTAP2 and WebAuthn definition of this object can be mapped.
 * Descriptions of the fields are from CTAP specification.
 * Field names are from WebAuthn specification.
 */
export const AuthenticatorMakeCredentialArgsSchema = z
  .object({
    /**
     * Hash of the ClientData contextual binding specified by host.
     *
     * Corresponding parameter name: clientDataHash (0x01)
     * CTAP Data type: Byte String
     * Required
     */
    hash: BytesSchema.meta({
      description:
        'Hash of the ClientData contextual binding specified by host.',
    }),

    /**
     * This PublicKeyCredentialRpEntity data structure describes a Relying Party with which the new public key credential will be associated.
     *
     * Corresponding parameter name: rp (0x02)
     * CTAP Data type: PublicKeyCredentialRpEntity
     * Required
     */
    rpEntity: PublicKeyCredentialRpEntitySchema.meta({
      description: "The Relying Party's entity information.",
    }),

    /**
     * The authenticator associates the created public key credential with the account identifier,
     * and MAY also associate any or all of the user name, and user display name.
     * The user name and display name are OPTIONAL for privacy reasons for single-factor scenarios where only user presence is required.
     *
     * Corresponding parameter name: name (0x03)
     * CTAP Data type: PublicKeyCredentialUserEntity
     * Required
     */
    userEntity: PublicKeyCredentialUserEntitySchema.meta({
      description: "The user account's entity information.",
    }),

    /**
     * Specifies whether this credential is to be discoverable or not.
     * If requireResidentKey is true, then authenticator MUST create a client-side discoverable credential.
     * The authenticator can choose whether to create resident key or not.
     * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred (Step 7.4)
     *
     * Corresponding parameter name: options.rk (0x07)
     * Default value: false
     *
     * NOTE: This virtual authenticator always create client-side discoverable credential as the private key cannot leave Key Vault.
     * Discoverable (Resident Key): Private key stored in Authenticator database - Key Vault in this implementation.
     * Non-Discoverable (Non-Resident Key): Private key stored on RP Server databse (as an encrypted blob) - Not in this Virtual authenticator implementation.
     */
    requireResidentKey: z.boolean().default(false).meta({
      description:
        'Specifies whether this credential is to be client-side discoverable or not.',
    }),

    /**
     * Instructs the authenticator to require user consent to complete the operation.
     * Platforms MAY send the "up" option key to CTAP2.1 authenticators, and its value MUST be true if present.
     *
     * Corresponds to parameter: options.up (0x07)
     * Default value: true
     */
    requireUserPresence: z.literal(true).default(true).meta({
      description: 'Whether user presence verification is required.',
    }),

    /**
     * If true, instructs the authenticator to require a user-verifying gesture in order to complete the request.
     * Examples of such gestures are fingerprint scan or a PIN.
     *
     * Corresponding parameter name: options.uv (0x07) or pinUvAuthParam (0x08)
     * Default value: false
     */
    requireUserVerification: z.boolean().default(false).meta({
      description: 'Whether user verification is required.',
    }),

    /**
     * A sequence of pairs of PublicKeyCredentialType and public key algorithms (COSEAlgorithmIdentifier)
     * requested by the Relying Party.
     * This sequence is ordered from most preferred to least preferred.
     * The authenticator makes a best-effort to create the most preferred credential that it can.
     *
     * Corresponding parameter name: pubKeyCredParams (0x04)
     * CTAP Data type: PublicKeyCredentialParameters[]
     * Required
     */
    credTypesAndPubKeyAlgs: z.array(PublicKeyCredentialParametersSchema).meta({
      description: 'List of supported algorithms for credential generation.',
    }),

    /**
     * An OPTIONAL list of PublicKeyCredentialDescriptor objects provided by the Relying Party
     * with the intention that, if any of these are known to the authenticator,
     * it SHOULD NOT create a new credential.
     * excludeCredentialDescriptorList contains a list of known credentials.
     *
     * Corresponding parameter name: excludeList (0x05)
     * CTAP Data type: PublicKeyCredentialDescriptor[]
     * Optional
     */
    excludeCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorSchema)
      .optional()
      .meta({
        description:
          'Optional list of credentials to exclude from creation (known credentials).',
      }),

    /**
     * An authenticator supporting this enterprise attestation feature is enterprise attestation
     * capable and signals its support via the ep Option ID in the authenticatorGetInfo command response.
     *
     * If the enterpriseAttestation parameter is absent, attestation’s privacy characteristics are unaffected,
     * regardless of whether the enterprise attestation feature is presently enabled.
     *
     * If present with a valid value, the usual privacy concerns around attestation batching may not
     * apply to the results of this operation and the platform is requesting an enterprise attestation
     * that includes uniquely identifying information.
     *
     * Correspoding parameter name: enterpriseAttestation (0x0A)
     * CTAP Data type: Unsigned Integer
     * Optional
     */
    enterpriseAttestationPossible: z.boolean().optional().meta({
      description:
        'Whether enterprise (individually-identifying) attestation is permitted.',
    }),

    /**
     * A prioritized list of attestation statement format identifiers that the client and/or RP prefers.
     * Authenticators that support multiple formats may use this list to select a format compatible with the caller.
     * Clients may request omission of attestation by including a single element with the string value "none".
     *
     * Correspoding parameter name: attestationFormatsPreference (0x0B)
     * CTAP Data type: String[]
     * Optional
     *
     * NOTE: We do not allow to omit this field.
     */
    attestationFormats: z.array(z.string()).meta({
      description:
        'Ordered list of preferred attestation statement format identifiers.',
    }),

    /**
     * Parameters to influence authenticator operation.
     * These parameters might be authenticator specific.
     *
     * Corresponding parameter name: extensions (0x06)
     * CTAP Data type: CBOR map of extension identifier -> authenticator extension input values
     * Optional
     */
    extensions: z.record(z.string(), z.unknown()).optional(),

    /**
     * UNMAPPED CTAP FIELDS:
     *
     * The following fields from the CTAP2 authenticatorMakeCredential specification are not
     * directly mapped to this WebAuthn schema:
     *
     * - pinUvAuthParam (0x08)
     *   CTAP Data type: Byte String
     *   Description: First 16 bytes of HMAC-SHA-256 of clientDataHash using pinUvAuthToken which
     *   platform got from the authenticator. When sent, the authenticator verifies pinUvAuthParam
     *   and returns an error if verification fails. Not required when requireUserVerification is false.
     *
     * - pinUvAuthProtocol (0x09)
     *   CTAP Data type: Unsigned Integer
     *   Description: PIN/UV protocol version chosen by the platform. Required when pinUvAuthParam
     *   is present.
     */
  })
  .meta({
    id: 'AuthenticatorMakeCredentialArgs',
    ref: 'AuthenticatorMakeCredentialArgs',
    description: `Input parameters for the authenticatorMakeCredential operation. ${see(
      'https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred',
    )}`,
  });

export type AuthenticatorMakeCredentialArgs = z.infer<
  typeof AuthenticatorMakeCredentialArgsSchema
>;
