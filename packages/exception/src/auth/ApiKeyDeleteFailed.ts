import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class ApiKeyDeleteFailed extends HTTPException {
  constructor() {
    super({
      status: 400,
      code: HTTPExceptionCode.API_KEY_DELETE_FAILED,
      message: 'Api key delete failed.',
    });
  }
}
