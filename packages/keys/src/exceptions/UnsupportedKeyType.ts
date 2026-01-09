import { Exception } from '@repo/exception';

export class UnsupportedKeyType extends Exception {
  static message = 'Unsupported key type.';
}
