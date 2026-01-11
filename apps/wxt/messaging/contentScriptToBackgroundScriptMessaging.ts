import { MessagingProtocol } from '@/types';
import { defineExtensionMessaging } from '@webext-core/messaging';

export const contentScriptToBackgroundScriptMessaging =
  defineExtensionMessaging<MessagingProtocol>();
