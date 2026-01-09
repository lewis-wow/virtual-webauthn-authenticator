import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class UnavailableForLegalReasons extends Exception {
  static status = HttpStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS;
  static readonly name = 'UnavailableForLegalReasons';
  static message = 'Unavailable For Legal Reasons.';
}
