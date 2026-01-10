import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class TooEarly extends Exception {
  static status = HttpStatusCode.TOO_EARLY_425;
  static readonly code = 'TooEarly';
  static message = 'Too Early.';
}
