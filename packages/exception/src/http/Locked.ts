import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Locked extends Exception {
  static status = HttpStatusCode.LOCKED_423;
  static readonly code = 'Locked';
  static message = 'Locked.';
}
