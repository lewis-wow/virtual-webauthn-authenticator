import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@repo/validation';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
