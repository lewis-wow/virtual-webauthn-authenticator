import z from 'zod';

export const DeleteWebAuthnCredentialRequestPathParamsSchema = z.object({
  id: z.uuid(),
});
