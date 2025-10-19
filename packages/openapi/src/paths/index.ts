import { keyPrefix } from '@repo/utils/keyPrefix';
import type { ZodOpenApiPathsObject } from 'zod-openapi';

import auth from './auth';
import credentials from './credentials';

export default {
  '/credentials': credentials,
  ...keyPrefix('/auth', auth),
} satisfies ZodOpenApiPathsObject;
