import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Gone extends Exception {
  static status = HttpStatusCode.GONE;
  static readonly name = 'Gone';
  static message = 'Gone.';
}
