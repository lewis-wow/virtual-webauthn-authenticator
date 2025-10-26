import { factory } from '@/factory';

import { apiKeyDeleteHandlers } from './delete.handlers';
import { apiKeyGetHandlers } from './get.handlers';
import { apiKeyPutHandlers } from './put.handlers';

export const apiKey = factory
  .createApp()
  .basePath('/')
  .get(...apiKeyGetHandlers)
  .put(...apiKeyPutHandlers)
  .delete(...apiKeyDeleteHandlers);
