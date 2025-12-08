import { AuthType } from '@repo/auth/enums';
import { ErrorMapper } from '@repo/core/mappers';

import { extensionMessaging } from '../messaging/extensionMessaging';

const LOG_PREFIX = 'BACKGROUND';

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
