import { factory } from '@/factory';

import { credentialsGetHandlers } from './get.handlers';
import { credentialsPostHandlers } from './post.handlers';

export const credentials = factory
  .createApp()
  .basePath('/')
  .get('/', ...credentialsGetHandlers)
  .post('/', ...credentialsPostHandlers);
