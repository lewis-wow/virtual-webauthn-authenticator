import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class InternalServerError extends HTTPException {
  constructor(message = 'Internal server error.') {
    super({
      status: 500,
      code: HTTPExceptionCode.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
