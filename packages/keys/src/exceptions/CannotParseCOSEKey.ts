import { Exception } from '@repo/exception';

export const CANNOT_PARSE_COSE_KEY = 'CANNOT_PARSE_COSE_KEY';

export class CannotParseCOSEKey extends Exception {
  constructor() {
    super({
      status: 400,
      code: CANNOT_PARSE_COSE_KEY,
      message: 'Cannot parse COSE Key.',
    });
  }
}
