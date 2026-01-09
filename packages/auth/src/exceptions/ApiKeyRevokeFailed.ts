import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyRevokeFailed extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'ApiKeyRevokeFailed';
  static message = 'Api key revoke failed.';
}
