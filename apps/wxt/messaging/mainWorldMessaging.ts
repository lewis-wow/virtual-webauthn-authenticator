import { defineWindowMessaging } from '@webext-core/messaging/page';

import { MessagingProtocol } from './extensionMessaging';

export const mainWorldMessaging = defineWindowMessaging<MessagingProtocol>({
  namespace: '@webext-core/messaging/main-world',
});
