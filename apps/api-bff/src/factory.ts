import { container } from '@/container';
import { Exception } from '@repo/exception';
import { InternalServerError } from '@repo/exception/http';
import { createFactory } from 'hono/factory';

export const factory = createFactory<{
  Variables: {
    container: typeof container;
  };
}>({
  initApp: (app) => {
    app.use((ctx, next) => {
      ctx.set('container', container);
      return next();
    });

    app.onError((error, ctx) => {
      const logger = ctx.get('container').resolve('logger');
      logger.exception(error);

      const exception =
        error instanceof Exception ? error : new InternalServerError();

      return exception.toResponse();
    });
  },
});
