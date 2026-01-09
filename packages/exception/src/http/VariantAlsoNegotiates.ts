import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class VariantAlsoNegotiates extends Exception {
  static status = HttpStatusCode.VARIANT_ALSO_NEGOTIATES;
  static readonly code = 'VariantAlsoNegotiates';
  static message = 'Variant Also Negotiates.';
}
