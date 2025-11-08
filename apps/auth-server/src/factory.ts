import type { auth } from '@/lib/auth';
import { createFactory } from 'hono/factory';

export const factory = createFactory<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();
