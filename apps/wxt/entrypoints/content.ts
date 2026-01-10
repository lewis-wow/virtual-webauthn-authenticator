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

    // Forward fetch requests from background script to main-world
    extensionMessaging.onMessage('fetch', async (req) => {
      console.log(`[${LOG_PREFIX}]`, 'fetch request from background', req.data);

      const response = await mainWorldMessaging.sendMessage('fetch', req.data);

      console.log(
        `[${LOG_PREFIX}]`,
        'fetch response from main-world',
        response,
      );

      return response;
    });
  },
});
