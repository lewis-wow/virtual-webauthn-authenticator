import { factory } from '@/factory';

import { credentials } from './credentials';
import { healthcheck } from './healthcheck';

export const api = factory
  .createApp()
  .basePath('/')
  .route('healthcheck', healthcheck)
  .route('credentials', credentials);
