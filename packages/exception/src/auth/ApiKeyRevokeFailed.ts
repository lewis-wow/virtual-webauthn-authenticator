import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class ApiKeyRevokeFailed extends HTTPException {
  constructor() {
    super({
      status: 400,
      code: HTTPExceptionCode.API_KEY_REVOKE_FAILED,
      message: 'Api key revoke failed.',
    });
  }
}
