import { extensionMessaging } from '@/messaging/extensionMessaging';
import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';

const LOG_PREFIX = 'CONTENT';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    console.log(`[${LOG_PREFIX}]`, 'Injecting script...');

    await injectScript('/main-world.js', {
      keepInDom: true,
    });

    console.log(`[${LOG_PREFIX}]`, 'Injected.');

    mainWorldMessaging.onMessage('credentials.create', async (req) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.create request.');

      const response = await extensionMessaging.sendMessage(
        'credentials.create',
        req.data,
      );

      console.log(`[${LOG_PREFIX}]`, 'credentials.create response.', response);

      return response;
    });

    mainWorldMessaging.onMessage('credentials.get', async (req) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.get request.');

      const response = await extensionMessaging.sendMessage(
        'credentials.get',
        req.data,
      );

      console.log(`[${LOG_PREFIX}]`, 'credentials.get response.', response);

      return response;
    });
  },
});
