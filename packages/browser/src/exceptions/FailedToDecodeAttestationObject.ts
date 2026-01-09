import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class FailedToDecodeAttestationObject extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'FailedToDecodeAttestationObject';
  static message = 'Failed to decode attestationObject';
}
