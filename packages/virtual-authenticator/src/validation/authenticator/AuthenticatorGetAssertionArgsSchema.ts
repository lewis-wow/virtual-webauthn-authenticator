import z from 'zod';

import { see } from '../../meta/see';
import { BytesSchema } from '../BytesSchema';
import { PublicKeyCredentialDescriptorSchema } from '../spec/PublicKeyCredentialDescriptorSchema';
import { RpIdSchema } from '../spec/RpIdSchema';

/**
 * Zod schema for authenticatorGetAssertion operation input parameters.
 *
 * This schema validates the parameters passed to the authenticator's assertion
 * generation operation as defined in the WebAuthn Level 3 specification.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorGetAssertion
 *
 * NOTE: This object is using the WebAuthn specification defintion.
 * The CTAP2 and WebAuthn definition of this object can be mapped.
 * Descriptions of the fields are from CTAP specification.
 * Field names are from WebAuthn specification.
 */
export const AuthenticatorGetAssertionArgsSchema = z
  .object({
    /**
     * Hash of the serialized client data collected by the host.
     *
     * Correspoding parameter name: clientDataHash (0x02)
     * CTAP Data type: Byte String
     * Required
     */
    hash: BytesSchema.meta({
      description: 'Hash of the serialized client data collected by the host.',
    }),

    /**
     * The caller's RP ID, as determined by the user agent and the client.
     *
     * Correspoding parameter name: rpId (0x01)
     * CTAP Data type: String
     * Required
     */
    rpId: RpIdSchema.meta({
      description: "The Relying Party's identifier.",
    }),

    /**
     * An OPTIONAL list of PublicKeyCredentialDescriptors describing credentials acceptable to the Relying Party (possibly filtered by the client), if any.
     *
     * Correspoding parameter name: allowList (0x03)
     * CTAP Data type: PublicKeyCredentialDescriptor[]
     * Optional
     */
    allowCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorSchema)
      .optional()
      .meta({
        description:
          'Optional list of credentials allowed for this authentication.',
      }),

    /**
     * Parameters to influence authenticator operation.
     * These parameters might be authenticator specific.
     *
     * Correspoding parameter name: extensions (0x04)
     * CTAP Data type: CBOR map of extension identifier -> authenticator extension input values
     * Optional
     */
    authenticatorExtensions: z.record(z.string(), z.unknown()).optional(),

    /**
     * Instructs the authenticator to require user consent to complete the operation.
     *
     * Correspoding parameter name: options.up (0x05)
     * Default value: true
     */
    requireUserPresence: z.boolean().default(true).meta({
      description: 'Whether user presence verification is required.',
    }),

    /**
     * If true, instructs the authenticator to require a user-verifying gesture in order to complete the request.
     * Examples of such gestures are fingerprint scan or a PIN.
     *
     * Correspoding parameter name: options.uv (0x05) or pinUvAuthParam (0x06)
     * Default value: false
     */
    requireUserVerification: z.boolean().default(false).meta({
      description: 'Whether user verification is required.',
    }),

    /**
     * UNMAPPED CTAP FIELDS:
     *
     * The following fields from the CTAP2 authenticatorGetAssertion specification are not
     * directly mapped to this WebAuthn schema:
     *
     * - pinUvAuthParam (0x06)
     *   CTAP Data type: Byte String
     *   Description: First 16 bytes of HMAC-SHA-256 of clientDataHash using pinUvAuthToken which
     *   platform got from the authenticator. When sent, the authenticator verifies pinUvAuthParam
     *   and returns an error if verification fails. Not required when requireUserVerification is false.
     *
     * - pinUvAuthProtocol (0x07)
     *   CTAP Data type: Unsigned Integer
     *   Description: PIN/UV protocol version chosen by the platform. Required when pinUvAuthParam
     *   is present.
     */
  })
  .meta({
    id: 'AuthenticatorGetAssertionArgs',
    ref: 'AuthenticatorGetAssertionArgs',
    description: `Input parameters for the authenticatorGetAssertion operation. ${see(
      'https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion',
    )}`,
  });

export type AuthenticatorGetAssertionArgs = z.infer<
  typeof AuthenticatorGetAssertionArgsSchema
>;
