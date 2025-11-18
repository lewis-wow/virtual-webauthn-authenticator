import { Exception } from '@repo/exception';

export const API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND';

export class ApiKeyNotFound extends Exception {
  status = 404;
  code = API_KEY_NOT_FOUND;
  message = 'Api key not found.';
}
