import z from 'zod';

import { AuthenticatorRegistrationExtension } from '../../enums/AuthenticatorRegistrationExtension';

export const AuthenticatorRegistrationExtensionSchema = z.enum(
  AuthenticatorRegistrationExtension,
);
