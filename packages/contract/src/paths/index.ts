import { addPrefixToKeys } from '@repo/utils';

import { auth } from './auth';

const PREFIX = '';

export const paths = {
  ...addPrefixToKeys(auth, PREFIX),
};
