import { Exception } from '@repo/exception';

export const CANNOT_PARSE_JSON_WEB_KEY = 'CANNOT_PARSE_JSON_WEB_KEY';

export class CannotParseJsonWebKey extends Exception {
  constructor() {
    super({
      status: 400,
      code: CANNOT_PARSE_JSON_WEB_KEY,
      message: 'Cannot parse Json Web Key.',
    });
  }
}
