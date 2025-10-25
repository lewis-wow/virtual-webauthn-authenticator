import { createDocument } from 'zod-openapi';

import { paths } from './paths';

export const document: object = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  paths,
});
