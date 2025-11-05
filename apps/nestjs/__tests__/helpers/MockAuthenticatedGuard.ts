import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MOCK_JWT_PAYLOAD } from '@repo/test-helpers';
import { Observable } from 'rxjs';

@Injectable()
export class MockAuthenticatedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    request.user = MOCK_JWT_PAYLOAD;

    return true;
  }
}
