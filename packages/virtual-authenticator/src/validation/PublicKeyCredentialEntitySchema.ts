import z from 'zod';

export const PublicKeyCredentialEntitySchema = z
  .object({
    name: z
      .string()
      .optional()
      .meta({
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
