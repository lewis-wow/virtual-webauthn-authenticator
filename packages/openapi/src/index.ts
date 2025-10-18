import { createDocument } from 'zod-openapi';

import paths from './paths';

export const openApiDocument: object = createDocument(
  {
    openapi: '3.1.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    paths,
  },
  {
    allowEmptySchema: {
      custom: true,
      set: { output: true },
    },
  },
);
