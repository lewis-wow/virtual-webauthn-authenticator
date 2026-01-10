import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class AttestationNotSupported extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'AttestationNotSupported';
  static message = 'Attestation not supported.';
}
