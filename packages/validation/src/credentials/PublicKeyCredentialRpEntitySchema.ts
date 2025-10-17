import type { IPublicKeyCredentialRpEntity } from '@repo/types';
import z from 'zod';

// Represents the Relying Party (application)
export const PublicKeyCredentialRpEntitySchema = z.object({
  name: z.string(),
  id: z.string().optional(),
}).meta({
  description: 'Represents the Relying Party (application). For more information, see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity.',
}) satisfies z.ZodType<IPublicKeyCredentialRpEntity>;
