import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Unauthorized } from '@repo/exception';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new Unauthorized();
    }

    return true;
  }
}
