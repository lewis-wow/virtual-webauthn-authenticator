import { Exception } from '@repo/exception';

export class NoSupportedPubKeyCredParamFound extends Exception {
  constructor() {
    super({
      code: 'NO_SUPPORTED_PUB_KEY_CRED_PARAM_FOUND',
      message: `No supported public key credential parameter found.`,
    });
  }
}
