import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class BadRequest extends HTTPException {
  constructor(message = 'Bad request.') {
    super({
      status: 400,
      code: HTTPExceptionCode.BAD_REQUEST,
      message,
    });
  }
}
