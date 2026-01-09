import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class RangeNotSatisfiable extends Exception {
  static status = HttpStatusCode.RANGE_NOT_SATISFIABLE;
  static readonly name = 'RangeNotSatisfiable';
  static message = 'Range Not Satisfiable.';
}
