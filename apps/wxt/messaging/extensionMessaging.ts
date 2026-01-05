import { MessageResponse } from '@/types';
import { PublicKeyCredentialCandidate } from '@repo/virtual-authenticator/validation';
import { defineExtensionMessaging } from '@webext-core/messaging';

export type MessagingProtocol = {
  'credentials.create': (
    req: CredentialCreationOptions | undefined,
  ) => MessageResponse<PublicKeyCredential | null>;

  'credentials.get': (
    req: CredentialRequestOptions | undefined,
  ) => MessageResponse<
    PublicKeyCredential | PublicKeyCredentialCandidate[] | null
  >;
};

export const extensionMessaging = defineExtensionMessaging<MessagingProtocol>();
