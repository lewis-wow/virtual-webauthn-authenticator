import { Exception } from '@repo/exception';

export const CANNOT_PARSE_JSON_WEB_KEY = 'CANNOT_PARSE_JSON_WEB_KEY';

export class CannotParseJsonWebKey extends Exception {
  static status = 400;
  static message = 'Cannot parse Json Web Key.';
  static code = CANNOT_PARSE_JSON_WEB_KEY;
}
