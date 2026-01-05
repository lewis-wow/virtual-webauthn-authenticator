import { Exception } from '@repo/exception';

export class CannotParseCOSEKey extends Exception {
  static status = 400;
  static message = 'Cannot parse COSE Key.';
}
