import { Exception } from '@repo/exception';

export const ATTESTATION_OBJECT_MISSING_AUTH_DATA =
  'ATTESTATION_OBJECT_MISSING_AUTH_DATA';

export class AttestationObjectMissingAuthData extends Exception {
  static code = ATTESTATION_OBJECT_MISSING_AUTH_DATA;
  static message = 'Attestation object is missing "authData"';
}
