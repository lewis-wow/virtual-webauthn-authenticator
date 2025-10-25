import { factory } from '@/factory';

import { apiKey } from './[id]';
import { apiKeysListHandlers } from './get.handlers';
import { apiKeyPostHandlers } from './post.handlers';

export const apiKeys = factory
  .createApp()
  .get('/', ...apiKeysListHandlers)
  .post('/', ...apiKeyPostHandlers)
  .route('/:id', apiKey);
