import z from 'zod';

/**
 * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialentity
 */
export const PublicKeyCredentialEntitySchema = z
  .object({
    name: z.string().meta({
      description: 'A human-friendly name for the Relying Party.',
      examples: ['Example Corp'],
    }),
  })
  .meta({
    id: 'PublicKeyCredentialEntity',
    ref: 'PublicKeyCredentialEntity',
  });

export type PublicKeyCredentialEntity = z.infer<
  typeof PublicKeyCredentialEntitySchema
>;
