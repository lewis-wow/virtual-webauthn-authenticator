import z from 'zod';

import { PublicKeyCredentialRpEntitySchema } from './PublicKeyCredentialRpEntitySchema';

export const PublicKeyCredentialRpEntityOptionsSchema =
  PublicKeyCredentialRpEntitySchema.extend({
    id: z.string().optional(),
  });

export type PublicKeyCredentialRpEntityOptions = z.infer<
  typeof PublicKeyCredentialRpEntityOptionsSchema
>;
