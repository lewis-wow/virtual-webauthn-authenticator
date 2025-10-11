import z from 'zod';
import type { IPublicKeyCredentialRpEntity } from '@repo/types';

// Represents the Relying Party (application)
export const PublicKeyCredentialRpEntitySchema = z.object({
  name: z.string(),
  id: z.string().optional(),
}) satisfies z.ZodType<IPublicKeyCredentialRpEntity>;
