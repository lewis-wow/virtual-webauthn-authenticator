import { createDocument } from 'zod-openapi';

import { credentialsPath } from './paths/credentials.js';

export const document: object = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'API',
    version: '1.0.0',
  },
  paths: {
    '/credentials': credentialsPath,
  },
});
