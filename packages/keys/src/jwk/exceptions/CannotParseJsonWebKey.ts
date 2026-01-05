import { Exception } from '@repo/exception';

export class CannotParseJsonWebKey extends Exception {
  static status = 400;
  static message = 'Cannot parse Json Web Key.';
}
