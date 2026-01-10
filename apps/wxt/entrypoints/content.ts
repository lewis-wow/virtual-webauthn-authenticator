import { extensionMessaging } from '@/messaging/extensionMessaging';
import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';

import { showErrorModal } from '../utils/showErrorModal';

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

      if (response && response.ok === false) {
        showErrorModal({
          message:
            response.error.message ||
            'An error occurred during credential creation.',
          data: response,
        });
      }

      console.log(`[${LOG_PREFIX}]`, 'credentials.create response.', response);

      return response;
    });

    mainWorldMessaging.onMessage('credentials.get', async (req) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.get request.');

      const response = await extensionMessaging.sendMessage(
        'credentials.get',
        req.data,
      );

      if (response && response.ok === false) {
        showErrorModal({
          message:
            response.error.message ||
            'An error occurred during credential get.',
          data: response,
        });
      }

      console.log(`[${LOG_PREFIX}]`, 'credentials.get response.', response);

      return response;
    });
  },
});
