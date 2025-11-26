import { Exception } from '@repo/exception';

export const FAILED_TO_DECODE_ATTESTATION_OBJECT =
  'FAILED_TO_DECODE_ATTESTATION_OBJECT';

export class FailedToDecodeAttestationObject extends Exception {
  static code = FAILED_TO_DECODE_ATTESTATION_OBJECT;
  static message = 'Failed to decode attestationObject';
}
