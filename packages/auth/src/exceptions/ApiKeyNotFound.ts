import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyNotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND_404;
  static readonly code = 'ApiKeyNotFound';
  static message = 'Api key not found.';
}
