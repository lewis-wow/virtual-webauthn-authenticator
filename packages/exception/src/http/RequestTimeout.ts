import { Exception } from '../Exception';

export const REQUEST_TIMEOUT = 'REQUEST_TIMEOUT';

export class RequestTimeout extends Exception {
  status = 408;
  code = REQUEST_TIMEOUT;

  constructor(message = 'Request Timeout.') {
    super({
      message,
    });
  }
}
