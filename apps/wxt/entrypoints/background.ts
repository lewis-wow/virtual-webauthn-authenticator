import { extensionMessaging } from '../messaging/extensionMessaging';

const LOG_PREFIX = 'BACKGROUND';

export default defineBackground(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init', {
    id: browser.runtime.id,
  });

  extensionMessaging.onMessage('credentials.create', async () => {
    return 'create' as const;
  });

  extensionMessaging.onMessage('credentials.get', async () => {
    return 'get' as const;
  });
});
