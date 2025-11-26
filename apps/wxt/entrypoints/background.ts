import { AuthType } from '@repo/auth/enums';
import { ErrorMapper } from '@repo/core/mappers';

import { extensionMessaging } from '../messaging/extensionMessaging';

const LOG_PREFIX = 'BACKGROUND';

export default defineBackground(() => {
  if (typeof globalThis.process === 'undefined') {
    // @ts-ignore
    globalThis.process = new Proxy(
      {},
      {
        get(target, prop) {
          console.warn(`🚨 BLOCKED ACCESS: process.${String(prop)}`);
          console.trace('Here is the code trying to access it:');
          return undefined; // Return undefined to keep script running (briefly)
        },
      },
    );
  }

  console.log(`[${LOG_PREFIX}]`, 'Init', {
    id: browser.runtime.id,
  });

  extensionMessaging.onMessage('credentials.create', async (req) => {
    const apiKey = await apiKeyItem.getValue();

    try {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URL}/api/credentials/create`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'X-Auth-Type': AuthType.API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.data),
        },
      );

      const json = await response.json();

      return { ok: response.ok, data: json };
    } catch (error) {
      return {
        ok: false,
        error: ErrorMapper.errorToErrorJSON(error),
      };
    }
  });

  extensionMessaging.onMessage('credentials.get', async (req) => {
    const apiKey = await apiKeyItem.getValue();

    try {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URL}/api/credentials/get`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'X-Auth-Type': AuthType.API_KEY,
            'Content-Type': 'application/json',
          },
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
