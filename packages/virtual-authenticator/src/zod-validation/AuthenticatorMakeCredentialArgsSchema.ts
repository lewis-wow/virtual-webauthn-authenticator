import z from 'zod';

import { PublicKeyCredentialType } from '../enums';
import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema';
import { PublicKeyCredentialRpEntitySchema } from './PublicKeyCredentialRpEntitySchema';
import { PublicKeyCredentialUserEntitySchema } from './PublicKeyCredentialUserEntitySchema';

/**
 * Zod schema for authenticatorMakeCredential operation input parameters.
 *
 * This schema validates the parameters passed to the authenticator's credential
 * creation operation as defined in the WebAuthn Level 3 specification.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
 */
export const AuthenticatorMakeCredentialArgsSchema = z
  .object({
    /**
     * The hash of the serialized client data, provided by the client.
     */
    hash: BytesSchema.meta({
      description: 'The hash of the serialized client data (SHA-256).',
    }),

    /**
     * The Relying Party's PublicKeyCredentialRpEntity.
     */
    rpEntity: PublicKeyCredentialRpEntitySchema.extend({ id: z.string() }).meta(
      {
        description: "The Relying Party's entity information.",
      },
    ),

    /**
     * The user account's PublicKeyCredentialUserEntity, containing the user handle
     * given by the Relying Party.
     */
    userEntity: PublicKeyCredentialUserEntitySchema.meta({
      description: "The user account's entity information.",
    }),

    /**
     * The effective resident key requirement for credential creation, a Boolean value
     * determined by the client.
     */
    requireResidentKey: z.boolean().meta({
      description:
        'Whether the authenticator must store a client-side discoverable credential.',
    }),

    /**
     * The constant Boolean value true, or FALSE when options.mediation is set to
     * conditional and the user agent previously collected consent from the user.
     */
    requireUserPresence: z.boolean().meta({
      description: 'Whether user presence verification is required.',
    }),

    /**
     * The effective user verification requirement for credential creation, a Boolean
     * value determined by the client.
     */
    requireUserVerification: z.boolean().meta({
      description: 'Whether user verification is required.',
    }),

    /**
     * A sequence of pairs of PublicKeyCredentialType and public key algorithms
     * (COSEAlgorithmIdentifier) requested by the Relying Party. This sequence is
     * ordered from most preferred to least preferred. The authenticator makes a
     * best-effort to create the most preferred credential that it can.
     */
    credTypesAndPubKeyAlgs: z
      .array(
        z
          .object({
            type: z.enum(PublicKeyCredentialType).meta({
              description: 'PublicKeyCredentialType (e.g., "public-key")',
            }),
            alg: z.number().meta({
              description: 'COSEAlgorithmIdentifier (e.g., -7 for ES256)',
            }),
          })
          .meta({
            description:
              'A pair of credential type and public key algorithm identifier.',
          }),
      )
      .meta({
        description:
          'Ordered list of credential type and algorithm pairs, from most to least preferred.',
      }),

    /**
     * An OPTIONAL list of PublicKeyCredentialDescriptor objects provided by the
     * Relying Party with the intention that, if any of these are known to the
     * authenticator, it SHOULD NOT create a new credential. excludeCredentialDescriptorList
     * contains a list of known credentials.
     */
    excludeCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorSchema)
      .optional()
      .meta({
        description:
          'Optional list of credentials to exclude from creation (known credentials).',
      }),

    /**
     * A Boolean value that indicates that individually-identifying attestation MAY
     * be returned by the authenticator.
     */
    enterpriseAttestationPossible: z.boolean().meta({
      description:
        'Whether enterprise (individually-identifying) attestation is permitted.',
    }),

    /**
     * A sequence of strings that expresses the Relying Party's preference for
     * attestation statement formats, from most to least preferable. If the
     * authenticator returns attestation, then it makes a best-effort attempt to use
     * the most preferable format that it supports.
     */
    attestationFormats: z.array(z.string()).meta({
      description:
        'Ordered list of preferred attestation statement format identifiers.',
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
