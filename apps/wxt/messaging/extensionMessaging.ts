import { MessageResponse } from '@/types';
import { PublicKeyCredentialCandidate } from '@repo/virtual-authenticator/validation';
import { defineExtensionMessaging } from '@webext-core/messaging';

export type MessagingProtocol = {
  'credentials.create': (
    req: CredentialCreationOptions | undefined,
  ) => MessageResponse<PublicKeyCredential>;

  'credentials.get': (
    req: CredentialCreationOptions | undefined,
  ) => MessageResponse<PublicKeyCredential | PublicKeyCredentialCandidate[]>;
};

export const extensionMessaging = defineExtensionMessaging<MessagingProtocol>();
