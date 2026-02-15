import { env } from '@/env';
import { contentScriptToBackgroundScriptMessaging } from '@/messaging/contentScriptToBackgroundScriptMessaging';
import type { MessagingProtocol } from '@/types';
import { nestjsContract } from '@repo/contract/nestjs';
import { Logger } from '@repo/logger';
import { initClient } from '@ts-rest/core';

const logger = new Logger({ prefix: 'BACKGROUND' });

logger.info('Init');

/**
 * Creates a typesafe ts-rest API client authenticated with the given API key.
 */
const createApiClient = (apiKey: string) =>
  initClient(nestjsContract, {
    baseUrl: env.WXT_API_BASE_URL,
    baseHeaders: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

export default defineBackground(() => {
  logger.info('Init', { id: browser.runtime.id });

  contentScriptToBackgroundScriptMessaging.onMessage(
    'credentials.create',
    async (req) => {
      const apiKey = await apiKeyItem.getValue();
      const client = createApiClient(apiKey);

      logger.info('credentials.create', { request: req.data });

      const response = await client.api.credentials.create({
        body: req.data,
      });

      logger.info('credentials.create', { response });

      if (response.status === 200) {
        // Response body is raw JSON (validateResponse defaults to false) so it is
        // serializable and compatible with the messaging protocol.
        return {
          ok: true as const,
          data: response.body,
        } as unknown as ReturnType<MessagingProtocol['credentials.create']>;
      }

      logger.error('Error', response.body);

      return {
        ok: false as const,
        error: response.body,
      } as unknown as ReturnType<MessagingProtocol['credentials.create']>;
    },
  );

  contentScriptToBackgroundScriptMessaging.onMessage(
    'credentials.get',
    async (req) => {
      const apiKey = await apiKeyItem.getValue();
      const client = createApiClient(apiKey);

      logger.info('credentials.get', { request: req.data });

      const response = await client.api.credentials.get({
        body: req.data,
      });

      logger.info('credentials.get', { response });

      if (response.status === 200) {
        return {
          ok: true as const,
          data: response.body,
        } as unknown as ReturnType<MessagingProtocol['credentials.get']>;
      }

      logger.error('Error', response.body);

      return {
        ok: false as const,
        error: response.body,
      } as unknown as ReturnType<MessagingProtocol['credentials.get']>;
    },
  );
});
