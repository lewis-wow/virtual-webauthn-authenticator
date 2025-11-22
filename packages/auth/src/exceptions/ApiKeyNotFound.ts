import { Exception } from '@repo/exception';

export const API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND';

export class ApiKeyNotFound extends Exception {
  static status = 404;
  static code = API_KEY_NOT_FOUND;
  static message = 'Api key not found.';
}
