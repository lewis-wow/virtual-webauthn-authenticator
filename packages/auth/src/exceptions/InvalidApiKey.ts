import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class InvalidApiKey extends Exception {
  static status = HttpStatusCode.UNAUTHORIZED;
  static readonly name = 'InvalidApiKey';
  static message = 'Invalid API key.';
}
