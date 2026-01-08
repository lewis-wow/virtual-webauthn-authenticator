import { MessagingProtocol } from '@/types';
import { defineWindowMessaging } from '@webext-core/messaging/page';

export const mainWorldMessaging = defineWindowMessaging<MessagingProtocol>({
  namespace: '@webext-core/messaging/main-world',
});
