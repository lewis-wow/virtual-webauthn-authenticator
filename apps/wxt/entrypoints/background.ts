import { env } from '@/env';
import { ErrorMapper } from '@repo/core/mappers';

import { extensionMessaging } from '../messaging/extensionMessaging';

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

  extensionMessaging.onMessage('credentials.create', async (req) => {
    const apiKey = await apiKeyItem.getValue();
    let response: Response | undefined = undefined;
    let rawContent: string | undefined = undefined;

    try {
      response = await fetch(
        `${env.WXT_API_BASE_URL}${API_CREDENTIALS_CREATE_PATH}`,
        {
          method: 'POST',
          headers: createApiHeaders(apiKey),
          body: JSON.stringify(req.data),
        },
      );

      rawContent = await response.text();

      const json = JSON.parse(rawContent);

      return { ok: response.ok, data: json };
    } catch (error) {
      return {
        ok: false,
        error: ErrorMapper.errorToErrorJSON({
          data: rawContent,
          error,
        }),
      };
    }
  });

  extensionMessaging.onMessage('credentials.get', async (req) => {
    const apiKey = await apiKeyItem.getValue();

    try {
      const response = await fetch(
        `${env.WXT_API_BASE_URL}${API_CREDENTIALS_GET_PATH}`,
        {
          method: 'POST',
          headers: createApiHeaders(apiKey),
          body: JSON.stringify(req.data),
        },
      );

      const json = await response.json();

      return { ok: response.ok, data: json, apiKey };
    } catch (error) {
      return { ok: false, error: ErrorMapper.errorToErrorJSON(error), apiKey };
    }
  });
});
