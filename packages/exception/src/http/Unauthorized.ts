import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from './HTTPException';

export class Unathorized extends HTTPException {
  constructor(message: string) {
    super({
      status: 401,
      code: HTTPExceptionCode.UNAUTHORIZED,
      message,
    });
  }
}
