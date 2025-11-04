import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { MOCK_JWT_PAYLOAD } from './consts';

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
