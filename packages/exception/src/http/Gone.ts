import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Gone extends Exception {
  static status = HttpStatusCode.GONE_410;
  static readonly code = 'Gone';
  static message = 'Gone.';
}
