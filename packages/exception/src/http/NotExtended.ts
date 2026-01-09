import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotExtended extends Exception {
  static status = HttpStatusCode.NOT_EXTENDED;
  static readonly name = 'NotExtended';
  static message = 'Not Extended.';
}
