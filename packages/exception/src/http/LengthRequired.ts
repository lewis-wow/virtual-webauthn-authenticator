import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class LengthRequired extends Exception {
  static status = HttpStatusCode.LENGTH_REQUIRED;
  static readonly name = 'LengthRequired';
  static message = 'Length Required.';
}
