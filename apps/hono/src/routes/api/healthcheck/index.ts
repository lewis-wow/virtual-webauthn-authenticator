import { factory } from '@/factory';

import { healthCheckGetHandlers } from './get.handlers';

export const healthcheck = factory
  .createApp()
  .basePath('/')
  .get('/', ...healthCheckGetHandlers);
