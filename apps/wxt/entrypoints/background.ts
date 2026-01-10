import { extensionMessaging } from '../messaging/extensionMessaging';

const LOG_PREFIX = 'BACKGROUND';

console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineBackground(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init', {
    id: browser.runtime.id,
  });

  // Handle fetch requests proxied from content script
  extensionMessaging.onMessage('fetch', async (req) => {
    console.log(`[${LOG_PREFIX}]`, 'Fetch request', {
      url: req.data.url,
      method: req.data.init.method,
    });

    try {
      const response = await fetch(req.data.url, req.data.init);
      const json = await response.json();

      console.log(`[${LOG_PREFIX}]`, 'Fetch response', {
        status: response.status,
      });

      return {
        status: response.status,
        json,
      };
    } catch (error) {
      console.error(`[${LOG_PREFIX}]`, 'Fetch error', error);
      throw error;
    }
  });
});
