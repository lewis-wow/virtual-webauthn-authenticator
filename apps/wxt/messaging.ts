import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  test(s: string): string;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
