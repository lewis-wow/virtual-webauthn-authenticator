import type { User } from '@repo/prisma';
import { createFactory } from 'hono/factory';
import type { JwtVariables } from 'hono/jwt';

export type FactoryEnv = {
  Variables: JwtVariables<{ sub: string }> & {
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
