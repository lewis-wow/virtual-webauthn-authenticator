import { factory } from '@/factory';

import { apiKeys } from './api-keys';

export const auth = factory.createApp().route('/api-keys', apiKeys);
