import { Exception } from '@repo/exception';

export class TypeAssertionError extends Exception {
  static message = 'Type mismatch';
  static code = 'TYPE_ASSERTION_ERROR';
  static status = 400;
}
