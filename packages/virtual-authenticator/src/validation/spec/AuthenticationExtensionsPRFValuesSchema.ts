import z from 'zod';

import { BytesSchema } from '../BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticationextensionsprfvalues
 */
export const AuthenticationExtensionsPRFValuesSchema = z.object({
  first: BytesSchema,
  second: BytesSchema.optional(),
});
