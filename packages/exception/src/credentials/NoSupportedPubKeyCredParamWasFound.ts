import { HTTPExceptionCode } from '@repo/enums';

import { HTTPException } from '../HTTPException';

export class NoSupportedPubKeyCredParamWasFound extends HTTPException {
  constructor() {
    super({
      status: 400,
      code: HTTPExceptionCode.NO_SUPPORTED_PUB_KEY_CRED_PARAM_WAS_FOUND,
      message: `No supported public key credential parameter was found.`,
    });
  }
}
