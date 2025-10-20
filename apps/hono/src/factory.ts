import { createFactory } from 'hono/factory';

export type FactoryEnv = {
  Variables: {};
};

export const factory = createFactory<FactoryEnv>({
  initApp: (app) => {
    app.use(async (_ctx, next) => {
      return next();
    });
  },
});
