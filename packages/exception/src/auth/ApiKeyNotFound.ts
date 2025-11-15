import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class ApiKeyNotFound extends HTTPException {
  constructor() {
    super({
      status: 404,
      code: HTTPExceptionCode.API_KEY_NOT_FOUND,
      message: 'Api key not found.',
    });
  }
}
