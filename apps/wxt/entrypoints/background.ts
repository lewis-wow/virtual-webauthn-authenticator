import { env } from '@/env';
import { contentScriptToBackgroundScriptMessaging } from '@/messaging/contentScriptToBackgroundScriptMessaging';

const LOG_PREFIX = 'BACKGROUND';
const API_CREDENTIALS_CREATE_PATH = '/api/credentials/create';
const API_CREDENTIALS_GET_PATH = '/api/credentials/get';
const CONTENT_TYPE = 'application/json';

console.log(`[${LOG_PREFIX}]`, 'Init');

/**
 * Creates common HTTP headers for API requests.
 * @param apiKey - The API key for authentication
 * @returns Headers object with Authorization, Auth-Type, and Content-Type
 */
const createApiHeaders = (apiKey: string): Headers => {
  return new Headers({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': CONTENT_TYPE,
  });
};

export default defineBackground(() => {
  console.log(`[${LOG_PREFIX}]`, 'Init', {
    id: browser.runtime.id,
  });

  contentScriptToBackgroundScriptMessaging.onMessage(
    'credentials.create',
    async (req) => {
      const apiKey = await apiKeyItem.getValue();

      console.log(`[${LOG_PREFIX}]`, 'credentials.create', {
        request: req.data,
      });

      const response = await fetch(
        `${env.WXT_API_BASE_URL}${API_CREDENTIALS_CREATE_PATH}`,
        {
          method: 'POST',
          headers: createApiHeaders(apiKey),
          body: JSON.stringify(req.data),
        },
      );

      console.log(`[${LOG_PREFIX}]`, 'credentials.create', {
        request: req.data,
        response,
      });

      const json = await response.json();

      if (response.ok) {
        return {
          ok: true,
          data: json,
        };
      }

      console.log(`[${LOG_PREFIX}]`, 'Error', json);

      return {
        ok: false,
        error: json,
      };
    },
  );

  contentScriptToBackgroundScriptMessaging.onMessage(
    'credentials.get',
    async (req) => {
      const apiKey = await apiKeyItem.getValue();

      console.log(`[${LOG_PREFIX}]`, 'credentials.get', {
        request: req.data,
      });

      const response = await fetch(
        `${env.WXT_API_BASE_URL}${API_CREDENTIALS_GET_PATH}`,
        {
          method: 'POST',
          headers: createApiHeaders(apiKey),
          body: JSON.stringify(req.data),
        },
      );

      console.log(`[${LOG_PREFIX}]`, 'credentials.get', {
        request: req.data,
        response,
      });

      const json = await response.json();

      if (response.ok) {
        return {
          ok: true,
          data: json,
        };
      }

      console.log(`[${LOG_PREFIX}]`, 'Error', json);

      return {
        ok: false,
        error: json,
      };
    },
  );
});
