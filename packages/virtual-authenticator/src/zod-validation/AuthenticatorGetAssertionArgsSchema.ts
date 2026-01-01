import z from 'zod';

import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema';
import { RpIdSchema } from './RpIdSchema';

/**
 * Zod schema for authenticatorGetAssertion operation input parameters.
 *
 * This schema validates the parameters passed to the authenticator's assertion
 * generation operation as defined in the WebAuthn Level 3 specification.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
 */
export const AuthenticatorGetAssertionArgsSchema = z
  .object({
    /**
     * The hash of the serialized client data, provided by the client.
     */
    hash: BytesSchema.meta({
      description: 'The hash of the serialized client data (SHA-256).',
    }),

    /**
     * The caller's RP ID, as determined by the user agent and the client.
     */
    rpId: RpIdSchema.meta({
      description: "The Relying Party's identifier.",
    }),

    /**
     * An OPTIONAL list of PublicKeyCredentialDescriptor objects provided by the
     * Relying Party with the intention that, if present, only credentials matching
     * this list should be used.
     */
    allowCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorSchema)
      .optional()
      .meta({
        description:
          'Optional list of credentials allowed for this authentication.',
      }),

    /**
     * A CBOR map from extension identifiers to their authenticator extension inputs,
     * created by the client based on the extensions requested by the Relying Party,
     * if any.
     */
    extensions: z.record(z.string(), z.unknown()).optional().meta({
      description:
        'Optional CBOR map of extension identifiers to authenticator extension inputs.',
    }),

    /**
     * The constant Boolean value true.
     * It is included here as a pseudo-parameter to
     * simplify applying this abstract authenticator model
     * to implementations that may wish to make a test
     * of user presence optional although WebAuthn does not.
     */
    requireUserPresence: z.boolean().meta({
      description: 'Whether user presence verification is required.',
    }),

    /**
     * A Boolean value that indicates whether user verification is required for this
     * assertion.
     */
    requireUserVerification: z.boolean().meta({
      description: 'Whether user verification is required.',
    }),
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
