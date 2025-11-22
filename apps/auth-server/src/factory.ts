import type { auth } from '@/lib/auth';
import { Exception } from '@repo/exception';
import { InternalServerError } from '@repo/exception/http';
import { ExceptionMapper } from '@repo/exception/mappers';
import { createFactory } from 'hono/factory';

export const factory = createFactory<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>({
  initApp: (app) => {
    app.onError((error) => {
      const exception =
        error instanceof Exception ? error : new InternalServerError();

      return ExceptionMapper.toResponse(exception);
    });
  },
});
