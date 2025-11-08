import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class InvalidApiKey extends HTTPException {
  constructor() {
    super({
      status: 401,
      code: HTTPExceptionCode.API_KEY_NOT_FOUND,
      message: 'Invalid API key.',
    });
  }
}
