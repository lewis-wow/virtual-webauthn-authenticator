import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { z, type ZodType } from 'zod';

export const zResponseValidator = <T extends ZodType>(schema: T) => {
  return createMiddleware(async (c, next) => {
    await next();

    const isJson = c.res.headers
      .get('Content-Type')
      ?.startsWith('application/json');

    if (!c.res.ok || !isJson) {
      return;
    }

    const originalBody = await c.res.clone().json();

    const result = schema.safeParse(originalBody);

    if (!result.success) {
      throw new HTTPException(500, {
        message: 'Response validation failed',
        cause: z.treeifyError(result.error),
      });
    }

    try {
      const encodedData = schema.encode(result.data);

      c.res = c.json(encodedData);
    } catch (error) {
      throw new HTTPException(500, {
        message: 'Failed to encode response data',
        cause: error,
      });
    }
  });
};
