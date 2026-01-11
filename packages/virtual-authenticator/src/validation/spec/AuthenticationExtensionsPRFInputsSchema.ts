import z from 'zod';

import { AuthenticationExtensionsPRFValuesSchema } from './AuthenticationExtensionsPRFValuesSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticationextensionsprfinputs
 */
export const AuthenticationExtensionsPRFInputsSchema = z.object({
  eval: AuthenticationExtensionsPRFValuesSchema,
  evalByCredential: z.record(
    z.string(),
    AuthenticationExtensionsPRFValuesSchema,
  ),
});
