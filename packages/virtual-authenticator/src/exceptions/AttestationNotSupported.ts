import { Exception } from '@repo/exception';

export const ATTESTATION_NOT_SUPPORTED = 'ATTESTATION_NOT_SUPPORTED';

export class AttestationNotSupported extends Exception {
  static status = 400;
  static code = ATTESTATION_NOT_SUPPORTED;
  static message = 'Attestation not supported.';
}
