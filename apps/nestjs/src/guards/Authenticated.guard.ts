import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@repo/auth/zod-validation';
import { Unauthorized } from '@repo/exception/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const jwtPayload = request.user as JwtPayload;

    if (!jwtPayload) {
      throw new Unauthorized();
    }

    return true;
  }
}
