import { Exception } from '../Exception';

export const BAD_GATEWAY = 'BAD_GATEWAY';

export class BadGateway extends Exception {
  status = 502;
  code = BAD_GATEWAY;

  constructor(message = 'Bad Gateway.') {
    super({
      message,
    });
  }
}
