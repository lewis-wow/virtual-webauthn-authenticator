import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class CannotParseJsonWebKey extends HTTPException {
  constructor() {
    super({
      status: 400,
      code: HTTPExceptionCode.CANNOT_PARSE_JSON_WEB_KEY,
      message: 'Cannot parse Json Web Key.',
    });
  }
}
