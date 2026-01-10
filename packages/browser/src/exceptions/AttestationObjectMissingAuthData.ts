import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class AttestationObjectMissingAuthData extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'AttestationObjectMissingAuthData';
  static message = 'Attestation object is missing "authData"';
}
