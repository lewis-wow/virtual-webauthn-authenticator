import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class Forbidden extends HTTPException {
  constructor(message = 'Access to this resource is forbidden.') {
    super({
      status: 403,
      code: HTTPExceptionCode.FORBIDDEN,
      message,
    });
  }
}
