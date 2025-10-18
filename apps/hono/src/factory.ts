import { auth } from '@repo/better-auth';
import { createFactory } from 'hono/factory';

export type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const factory = createFactory<Env>({
  initApp: (app) => {
    app.use(async (ctx, next) => {
      ctx.set('user', null);
      ctx.set('session', null);

      const session = await auth.api.getSession({
        headers: ctx.req.raw.headers,
      });

      if (!session) {
        return next();
      }

      ctx.set('user', session.user);
      ctx.set('session', session.session);
      return next();
    });
  },
});
