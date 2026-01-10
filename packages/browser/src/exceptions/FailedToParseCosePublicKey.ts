import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class FailedToParseCosePublicKey extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'FailedToParseCosePublicKey';
  static message = 'Failed to parse COSE public key';
}
