import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class ApiKeyDeleteEnabledFailed extends HTTPException {
  constructor() {
    super({
      status: 400,
      code: HTTPExceptionCode.API_KEY_DELETE_ENABLED_FAILED,
      message: 'Api key delete enabled failed.',
    });
  }
}
