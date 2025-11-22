import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@repo/auth/validation';

export const Jwt = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
