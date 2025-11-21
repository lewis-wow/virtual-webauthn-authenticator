import { defineExtensionMessaging } from '@webext-core/messaging';

export type MessagingProtocol = {
  'credentials.get': () => 'get';
  'credentials.create': () => 'create';
};

export const extensionMessaging = defineExtensionMessaging<MessagingProtocol>();
