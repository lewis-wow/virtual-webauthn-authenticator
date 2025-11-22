import { Exception } from '@repo/exception';

export const NO_SUPPORTED_PUB_KEY_CRED_PARAM_FOUND =
  'NO_SUPPORTED_PUB_KEY_CRED_PARAM_FOUND';

export class NoSupportedPubKeyCredParamFound extends Exception {
  static code = NO_SUPPORTED_PUB_KEY_CRED_PARAM_FOUND;
  static message = `No supported public key credential parameter found.`;
  static status = 400;
}
