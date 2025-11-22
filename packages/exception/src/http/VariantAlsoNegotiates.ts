import { Exception } from '../Exception';

export const VARIANT_ALSO_NEGOTIATES = 'VARIANT_ALSO_NEGOTIATES';

export class VariantAlsoNegotiates extends Exception {
  static status = 506;
  static code = VARIANT_ALSO_NEGOTIATES;

  constructor(message = 'Variant Also Negotiates.') {
    super({
      message,
    });
  }
}
