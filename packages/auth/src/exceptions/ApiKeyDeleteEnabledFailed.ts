import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ApiKeyDeleteEnabledFailed extends Exception {
  static status = HttpStatusCode.METHOD_NOT_ALLOWED;
  static readonly name = 'ApiKeyDeleteEnabledFailed';
  static message = 'Api key delete enabled failed.';
}
