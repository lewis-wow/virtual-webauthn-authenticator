import { Exception } from '@repo/exception';

import type { Attestation } from '../enums/Attestation';

export type AttestationNotSupportedData = {
  attestation: Attestation;
};

export const ATTESTATION_NOT_SUPPORTED = 'ATTESTATION_NOT_SUPPORTED';

export class AttestationNotSupported extends Exception<AttestationNotSupportedData> {
  static status = 400;
  static code = ATTESTATION_NOT_SUPPORTED;
  static message(data: AttestationNotSupportedData) {
    return `Attestation ${data.attestation} not supported.`;
  }
}
