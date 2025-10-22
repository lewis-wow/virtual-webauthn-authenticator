import type { User } from '@repo/prisma';
import { createFactory } from 'hono/factory';

export type FactoryEnv = {
  Variables: {
    user: Pick<User, 'id' | 'name'> | null;
  };
};

export const factory = createFactory<FactoryEnv>({
  initApp: (app) => {
    app.use(async (_ctx, next) => {
      return next();
    });
  },
});
