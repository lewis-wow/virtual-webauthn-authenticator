import z from 'zod';

import { BaseStateSchema } from './BaseStateSchema';

export const CredentialSelectionStateSchema = BaseStateSchema.extend({
  credentialId: z.string(),
});

export type CredentialSelectionState = z.infer<
  typeof CredentialSelectionStateSchema
>;
