import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotAcceptable extends Exception {
  static status = HttpStatusCode.NOT_ACCEPTABLE;
  static readonly name = 'NotAcceptable';
  static message = 'Not Acceptable.';
}
