import { Exception } from '../Exception';

export const TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';

export class TooManyRequests extends Exception {
  static status = 429;
  static code = TOO_MANY_REQUESTS;

  constructor(message = 'Too Many Requests.') {
    super({
      message,
    });
  }
}
