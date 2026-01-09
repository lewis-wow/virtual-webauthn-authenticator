import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Locked extends Exception {
  static status = HttpStatusCode.LOCKED;
  static readonly name = 'Locked';
  static message = 'Locked.';
}
