import { Exception } from '@repo/exception';

export class ApiKeyNotExists extends Exception {
  static code = 'API_KEY_NOT_EXISTS';
  static message = 'API key not exists.';
  static status = 404;
}
