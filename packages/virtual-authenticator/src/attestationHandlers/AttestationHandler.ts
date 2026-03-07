import type { AttestationStatementMap } from '../cbor/AttestationStatementMap';

export interface AttestationHandler {
  readonly attestationFormat: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createAttestation(opts: any): Promise<AttestationStatementMap>;
}
