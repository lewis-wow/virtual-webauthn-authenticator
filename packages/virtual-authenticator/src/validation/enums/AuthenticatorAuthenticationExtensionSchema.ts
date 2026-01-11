import z from 'zod';

import { AuthenticatorAuthenticationExtension } from '../../enums/AuthenticatorAuthenticationExtension';

export const AuthenticatorAuthenticationExtensionSchema = z.enum(
  AuthenticatorAuthenticationExtension,
);
