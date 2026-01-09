import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class SignatureFailed extends Exception {
  static status = HttpStatusCode.INTERNAL_SERVER_ERROR;
  static readonly code = 'SignatureFailed';
  static message = 'Signature failed.';
}
