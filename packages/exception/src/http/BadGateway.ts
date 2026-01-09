import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class BadGateway extends Exception {
  static status = HttpStatusCode.BAD_GATEWAY;
  static readonly name = 'BadGateway';
  static message = 'Bad Gateway.';
}
