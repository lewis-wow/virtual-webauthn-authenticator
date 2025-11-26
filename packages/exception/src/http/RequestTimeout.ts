import { Exception } from '../Exception';

export const REQUEST_TIMEOUT = 'REQUEST_TIMEOUT';

export class RequestTimeout extends Exception {
  static status = 408;
  static code = REQUEST_TIMEOUT;

  constructor(message = 'Request Timeout.') {
    super({
      message,
    });
  }
}
