import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyNotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND;
  static readonly name = 'ApiKeyNotFound';
  static message = 'Api key not found.';
}
