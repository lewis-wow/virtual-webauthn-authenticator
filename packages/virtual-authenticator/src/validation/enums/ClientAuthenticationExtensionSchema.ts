import z from 'zod';

import { ClientAuthenticationExtension } from '../../enums/ClientAuthenticationExtension';

export const ClientAuthenticationExtensionSchema = z.enum(
  ClientAuthenticationExtension,
);
