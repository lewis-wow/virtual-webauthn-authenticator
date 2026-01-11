import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyNotExists extends Exception {
  static status = HttpStatusCode.NOT_FOUND_404;
  static readonly code = 'ApiKeyNotExists';
  static message = 'API key not exists.';
}
