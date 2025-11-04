import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class CannotParseCOSEKey extends HTTPException {
  constructor() {
    super({
      status: 400,
      code: HTTPExceptionCode.CANNOT_PARSE_COSE_KEY,
      message: 'Cannot parse COSE Key.',
    });
  }
}
