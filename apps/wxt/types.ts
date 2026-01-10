import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import z from 'zod';

/**
 * Messaging protocol between main-world, content script, and background.
 * Data is serialized in main-world and passed through content to background.
 * Background returns raw API response (unknown) which is parsed in main-world.
 */
export type MessagingProtocol = {
  'credentials.create': (
    req: z.input<typeof CreateCredentialBodySchema>,
  ) => z.input<typeof PublicKeyCredentialDtoSchema>;

  'credentials.get': (
    req: z.input<typeof GetCredentialBodySchema>,
  ) => z.input<typeof PublicKeyCredentialDtoSchema>;
};
