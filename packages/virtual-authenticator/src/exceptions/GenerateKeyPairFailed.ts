import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class GenerateKeyPairFailed extends Exception {
  static status = HttpStatusCode.INTERNAL_SERVER_ERROR_500;
  static readonly code = 'GenerateKeyPairFailed';
  static message = 'Generate key pair failed.';
}
