import { VirtualAuthenticator } from '@repo/virtual-authenticator';

import { Lazy } from './utils/Lazy';

export const virtualAuthenticator = new Lazy(
  'virtualAuthenticator',
  () => new VirtualAuthenticator(),
);
