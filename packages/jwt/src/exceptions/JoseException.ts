import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class JoseException extends Exception {
  static override status = HttpStatusCode.INTERNAL_SERVER_ERROR_500;
  static readonly code: string = 'JoseException';
  static override message = 'An unexpected Jose error occurred.';
}
