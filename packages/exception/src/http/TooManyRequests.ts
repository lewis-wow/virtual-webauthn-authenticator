import { Exception } from '../Exception';

export const TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';

export class TooManyRequests extends Exception {
  status = 429;
  code = TOO_MANY_REQUESTS;

  constructor(message = 'Too Many Requests.') {
    super({
      message,
    });
  }
}
