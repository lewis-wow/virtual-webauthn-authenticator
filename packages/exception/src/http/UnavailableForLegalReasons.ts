import { Exception } from '../Exception';

export const UNAVAILABLE_FOR_LEGAL_REASONS = 'UNAVAILABLE_FOR_LEGAL_REASONS';

export class UnavailableForLegalReasons extends Exception {
  static status = 451;
  static code = UNAVAILABLE_FOR_LEGAL_REASONS;

  constructor(message = 'Unavailable For Legal Reasons.') {
    super({
      message,
    });
  }
}
