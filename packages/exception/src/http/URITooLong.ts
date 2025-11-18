import { Exception } from '../Exception';

export const URI_TOO_LONG = 'URI_TOO_LONG';

export class URITooLong extends Exception {
  status = 414;
  code = URI_TOO_LONG;

  constructor(message = 'URI Too Long.') {
    super({
      message,
    });
  }
}
