import z from 'zod';

import { ClientRegistrationExtension } from '../../enums/ClientRegistrationExtension';

export const ClientRegistrationExtensionSchema = z.enum(
  ClientRegistrationExtension,
);
