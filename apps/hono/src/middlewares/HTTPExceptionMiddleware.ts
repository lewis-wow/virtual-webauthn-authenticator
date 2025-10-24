import { factory } from '@/factory';
import { HTTPException } from '@/lib/utils/HTTPException';

export const HTTPExceptionMiddleware = factory.createMiddleware(
  async (_ctx, next) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        return error.toResponse();
      }

      throw error;
    }
  },
);
