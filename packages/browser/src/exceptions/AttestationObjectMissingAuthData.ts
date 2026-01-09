import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class AttestationObjectMissingAuthData extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'AttestationObjectMissingAuthData';
  static message = 'Attestation object is missing "authData"';
}
