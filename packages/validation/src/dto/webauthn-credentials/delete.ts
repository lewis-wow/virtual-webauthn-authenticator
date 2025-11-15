import z from 'zod';

import { DeleteResponseSchema } from '../common/DeleteResponseSchema';

export const DeleteWebAuthnCredentialRequestPathParamsSchema = z.object({
  id: z.uuid(),
});

export const DeleteWebAuthnCredentialResponseSchema = DeleteResponseSchema;
