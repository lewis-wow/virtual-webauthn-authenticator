import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Locked extends Exception {
  static status = HttpStatusCode.LOCKED;
  static readonly code = 'Locked';
  static message = 'Locked.';
}
