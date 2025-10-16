import type { IPublicKeyCredentialRpEntity } from '@repo/types';
import z from 'zod';

// Represents the Relying Party (application)
export const PublicKeyCredentialRpEntitySchema = z.object({
  name: z.string(),
  id: z.string().optional(),
}).meta({
  description: 'Represents the Relying Party (application).',
}) satisfies z.ZodType<IPublicKeyCredentialRpEntity>;
