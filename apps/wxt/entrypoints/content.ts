import { extensionMessaging } from '@/messaging/extensionMessaging';
import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';

const LOG_PREFIX = 'CONTENT';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    console.log(`[${LOG_PREFIX}]`, 'Injecting script...');

    mainWorldMessaging.onMessage('credentials.create', async () => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.create request.');

      const response =
        await extensionMessaging.sendMessage('credentials.create');

      console.log(`[${LOG_PREFIX}]`, 'credentials.create response.', response);

      return response;
    });

    mainWorldMessaging.onMessage('credentials.get', async () => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.get request.');

      const response = await extensionMessaging.sendMessage('credentials.get');

      console.log(`[${LOG_PREFIX}]`, 'credentials.get response.', response);

      return response;
    });

    await injectScript('/main-world.js', {
      keepInDom: true,
    });

    console.log(`[${LOG_PREFIX}]`, 'Injected.');
  },
});
