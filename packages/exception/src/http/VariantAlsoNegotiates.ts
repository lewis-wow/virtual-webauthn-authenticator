import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class VariantAlsoNegotiates extends Exception {
  static status = HttpStatusCode.VARIANT_ALSO_NEGOTIATES;
  static readonly name = 'VariantAlsoNegotiates';
  static message = 'Variant Also Negotiates.';
}
