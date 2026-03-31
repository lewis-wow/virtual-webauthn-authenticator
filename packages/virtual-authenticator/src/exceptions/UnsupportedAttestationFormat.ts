import { Exception } from '@repo/exception';

export class UnsupportedAttestationFormat extends Exception {
  constructor(opts?: { cause?: Error; message?: string }) {
    super({
      message: opts?.message ?? 'Unsupported attestation format is used.',
      cause: opts?.cause,
    });
  }
}
