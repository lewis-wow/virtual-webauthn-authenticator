import { Exception } from '../Exception';

export const URI_TOO_LONG = 'URI_TOO_LONG';

export class URITooLong extends Exception {
  static status = 414;
  static code = URI_TOO_LONG;

  constructor(message = 'URI Too Long.') {
    super({
      message,
    });
  }
}
