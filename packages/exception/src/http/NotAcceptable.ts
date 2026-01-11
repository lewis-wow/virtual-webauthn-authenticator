import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotAcceptable extends Exception {
  static status = HttpStatusCode.NOT_ACCEPTABLE_406;
  static readonly code = 'NotAcceptable';
  static message = 'Not Acceptable.';
}
