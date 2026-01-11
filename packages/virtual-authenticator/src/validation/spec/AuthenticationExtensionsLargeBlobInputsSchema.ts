import z from 'zod';

import { BytesSchema } from '../BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticationextensionslargeblobinputs
 */
export const AuthenticationExtensionsLargeBlobInputsSchema = z.object({
  read: z.boolean().optional(),
  support: z.string().optional(),
  write: BytesSchema.optional(),
});
