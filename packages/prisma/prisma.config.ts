import { join } from 'path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: join('src', 'schema.prisma'),
  migrations: {
    path: join('src', 'migrations'),
  },
  views: {
    path: join('src', 'views'),
  },
  typedSql: {
    path: join('src', 'queries'),
  },
});
