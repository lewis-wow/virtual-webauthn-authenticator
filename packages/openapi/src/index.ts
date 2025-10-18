import { createDocument } from 'zod-openapi';

import { apiKeysPath } from './paths/auth/api-keys.js';
import { credentialsPath } from './paths/credentials.js';

export const openApiDocument: object = createDocument(
  {
    openapi: '3.1.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    paths: {
      '/credentials': credentialsPath,
      '/auth/api-keys': apiKeysPath,
    },
  },
  {
    allowEmptySchema: {
      custom: true,
      set: { output: true },
    },
  },
);
