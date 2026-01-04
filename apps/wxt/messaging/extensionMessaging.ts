import { MessageResponse } from '@/types';
import type {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import type { PublicKeyCredential } from '@repo/virtual-authenticator/validation';
import { defineExtensionMessaging } from '@webext-core/messaging';
import { z } from 'zod';

export type MessagingProtocol = {
  'credentials.create': (
    req: z.input<typeof CreateCredentialBodySchema>,
  ) => MessageResponse<PublicKeyCredential>;

  'credentials.get': (
    req: z.input<typeof GetCredentialBodySchema>,
  ) => MessageResponse<PublicKeyCredential>;
};

export const extensionMessaging = defineExtensionMessaging<MessagingProtocol>();
