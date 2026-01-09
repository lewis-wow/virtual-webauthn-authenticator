import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Conflict extends Exception {
  static status = HttpStatusCode.CONFLICT;
  static readonly name = 'Conflict';
  static message = 'Conflict.';
}
