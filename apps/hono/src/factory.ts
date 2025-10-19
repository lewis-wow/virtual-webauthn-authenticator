import { auth } from '@repo/better-auth';
import { IamManager } from '@repo/iam-manager';
import { prisma } from '@repo/prisma';
import { createFactory } from 'hono/factory';

export type FactoryEnv = {
  Variables:
    | {
        iamManager: null;
        user: null;
        session: null;
      }
    | {
        iamManager: IamManager;
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
      };
};

export const factory = createFactory<FactoryEnv>({
  initApp: (app) => {
    app.use(async (ctx, next) => {
      ctx.set('user', null);
      ctx.set('session', null);
      ctx.set('iamManager', null);

      const session = await auth.api.getSession({
        headers: ctx.req.raw.headers,
      });

      if (!session) {
        return next();
      }

      ctx.set('user', session.user);
      ctx.set('session', session.session);
      ctx.set('iamManager', new IamManager({ prisma, user: session.user }));

      return next();
    });
  },
});
