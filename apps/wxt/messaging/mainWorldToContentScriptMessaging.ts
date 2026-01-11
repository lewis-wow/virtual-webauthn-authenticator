import { MessagingProtocol } from '@/types';
import { defineWindowMessaging } from '@webext-core/messaging/page';

export const mainWorldToContentScriptMessaging =
  defineWindowMessaging<MessagingProtocol>({
    namespace: '@webext-core/messaging/main-world-to-content-script',
  });
