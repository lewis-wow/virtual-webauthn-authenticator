import { Exception } from '@repo/exception';

export const FAILED_TO_DECODE_ATTESTATION_OBJECT =
  'FAILED_TO_DECODE_ATTESTATION_OBJECT';

export class FailedToDecodeAttestationObject extends Exception {
  code = FAILED_TO_DECODE_ATTESTATION_OBJECT;
  message = 'Failed to decode attestationObject';
}
