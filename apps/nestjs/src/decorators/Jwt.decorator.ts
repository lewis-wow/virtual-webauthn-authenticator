import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@repo/auth/zod-validation';

export const Jwt = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
