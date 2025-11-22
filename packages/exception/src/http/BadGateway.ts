import { Exception } from '../Exception';

export const BAD_GATEWAY = 'BAD_GATEWAY';

export class BadGateway extends Exception {
  static status = 502;
  static code = BAD_GATEWAY;

  constructor(message = 'Bad Gateway.') {
    super({
      message,
    });
  }
}
