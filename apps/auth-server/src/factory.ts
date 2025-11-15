import type { auth } from '@/lib/auth';
import { HTTPException, InternalServerError } from '@repo/exception';
import { createFactory } from 'hono/factory';

export const factory = createFactory<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>({
  initApp: (app) => {
    app.onError((error) => {
      if (error instanceof HTTPException) {
        return error.toResponse();
      }

      return new InternalServerError().toResponse();
    });
  },
});
