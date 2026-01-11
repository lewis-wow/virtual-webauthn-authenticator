import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyDeleteFailed extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'ApiKeyDeleteFailed';
  static message = 'Api key delete failed.';
}
