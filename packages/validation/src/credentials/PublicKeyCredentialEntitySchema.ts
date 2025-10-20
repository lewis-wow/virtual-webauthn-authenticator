import z from 'zod';

export const PublicKeyCredentialEntitySchema = z
  .object({
    name: z.string().meta({
      description: 'A human-friendly name for the Relying Party.',
      examples: ['Example Corp'],
    }),
  })
  .meta({
    id: 'PublicKeyCredentialEntity',
  });
