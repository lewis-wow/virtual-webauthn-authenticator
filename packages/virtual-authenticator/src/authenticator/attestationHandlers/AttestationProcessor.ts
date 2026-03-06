import type { AttestationHandlerRegistry } from './AttestationHandlerRegistry';

export type ProcessArgs = {
  attestationFormat: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export class AttestationProcessor {
  constructor(private readonly registry: AttestationHandlerRegistry) {}

  async process(opts: ProcessArgs) {
    const { attestationFormat, data } = opts;

    const attestationHandler = this.registry.get(attestationFormat);

    if (!attestationHandler) {
      throw new Error('Unsupported attestation format is used.');
    }

    return attestationHandler.createAttestation(data);
  }
}
