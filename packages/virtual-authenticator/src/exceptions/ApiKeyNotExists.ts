import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyNotExists extends Exception {
  static status = HttpStatusCode.NOT_FOUND;
  static readonly name = 'ApiKeyNotExists';
  static message = 'API key not exists.';
}
