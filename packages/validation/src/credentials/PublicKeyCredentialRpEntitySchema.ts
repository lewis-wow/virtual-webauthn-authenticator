import type { IPublicKeyCredentialRpEntity } from '@repo/types';
import z from 'zod';

// Represents the Relying Party (application)
export const PublicKeyCredentialRpEntitySchema = z
  .object({
    name: z.string().meta({
      description: 'A human-friendly name for the Relying Party.',
      examples: ['Example Corp'],
    }),
    id: z
      .string()
      .optional()
      .meta({
        description:
          'The domain of the Relying Party. This is used to scope the credentials.',
        examples: ['example.com'],
      }),
  })
  .meta({
    description:
      'Represents the Relying Party (application). For more information, see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity.',
  }) satisfies z.ZodType<IPublicKeyCredentialRpEntity>;
