import { Exception } from '@repo/exception';

import type { Attestation } from '../enums/Attestation';

export type AttestationNotSupportedOptions = {
  attestation: Attestation;
};

export class AttestationNotSupported extends Exception {
  constructor(opts: AttestationNotSupportedOptions) {
    super({
      code: 'ATTESTATION_NOT_SUPPORTED',
      message: `Attestation ${opts.attestation} not supported.`,
    });
  }
}
