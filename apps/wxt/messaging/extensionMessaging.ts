import { MessageResponse } from '@/types';
import type {
  CreateCredentialRequestBodySchema,
  GetCredentialRequestBodySchema,
} from '@repo/contract/validation';
import type { PublicKeyCredential } from '@repo/virtual-authenticator/validation';
import { defineExtensionMessaging } from '@webext-core/messaging';
import { Schema } from 'effect';

export type MessagingProtocol = {
  'credentials.create': (
    req: Schema.Schema.Encoded<typeof CreateCredentialRequestBodySchema>,
  ) => MessageResponse<PublicKeyCredential>;

  'credentials.get': (
    req: Schema.Schema.Encoded<typeof GetCredentialRequestBodySchema>,
  ) => MessageResponse<PublicKeyCredential>;
};

export const extensionMessaging = defineExtensionMessaging<MessagingProtocol>();
