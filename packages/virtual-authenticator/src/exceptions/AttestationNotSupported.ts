import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class AttestationNotSupported extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'AttestationNotSupported';
  static message = 'Attestation not supported.';
}
