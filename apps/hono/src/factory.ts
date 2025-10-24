import { auth } from '@/lib/auth';
import { createFactory } from 'hono/factory';

export type FactoryEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const factory = createFactory<FactoryEnv>({
  initApp: (app) => {
    app.use(async (ctx, next) => {
      const session = await auth.api.getSession({
        headers: ctx.req.raw.headers,
      });

      if (!session) {
        ctx.set('user', null);
        ctx.set('session', null);
        return next();
      }

      ctx.set('user', session.user);
      ctx.set('session', session.session);
      return next();
    });
  },
});
