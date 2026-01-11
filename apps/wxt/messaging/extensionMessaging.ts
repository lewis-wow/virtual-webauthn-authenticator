import { MessagingProtocol } from '@/types';
import { defineExtensionMessaging } from '@webext-core/messaging';

export const extensionMessaging = defineExtensionMessaging<MessagingProtocol>();
