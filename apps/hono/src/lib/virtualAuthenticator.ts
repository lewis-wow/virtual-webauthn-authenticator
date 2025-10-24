import { VirtualAuthenticator } from '@repo/virtual-authenticator';

import { Lazy } from './utils/lazy';

export const virtualAuthenticator = new Lazy(
  'virtualAuthenticator',
  () => new VirtualAuthenticator(),
);
