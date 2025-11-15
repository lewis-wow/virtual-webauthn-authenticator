import z from 'zod';

export const GetWebAuthnCredentialRequestPathParamsSchema = z.object({
  id: z.uuid(),
});
