import z from 'zod';

import { AuthenticationExtensionsPRFValuesDtoSchema } from './AuthenticationExtensionsPRFValuesDtoSchema';

export const AuthenticationExtensionsPRFInputsDtoSchema = z.object({
  eval: AuthenticationExtensionsPRFValuesDtoSchema,
  evalByCredential: z.record(
    z.string(),
    AuthenticationExtensionsPRFValuesDtoSchema,
  ),
});
