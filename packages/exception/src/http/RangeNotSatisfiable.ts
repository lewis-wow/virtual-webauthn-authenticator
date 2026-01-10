import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class RangeNotSatisfiable extends Exception {
  static status = HttpStatusCode.RANGE_NOT_SATISFIABLE_416;
  static readonly code = 'RangeNotSatisfiable';
  static message = 'Range Not Satisfiable.';
}
