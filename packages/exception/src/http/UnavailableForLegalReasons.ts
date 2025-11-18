import { Exception } from '../Exception';

export const UNAVAILABLE_FOR_LEGAL_REASONS =
  'UNAVAILABLE_FOR_LEGAL_REASONS';

export class UnavailableForLegalReasons extends Exception {
  status = 451;
  code = UNAVAILABLE_FOR_LEGAL_REASONS;

  constructor(message = 'Unavailable For Legal Reasons.') {
    super({
      message,
    });
  }
}
