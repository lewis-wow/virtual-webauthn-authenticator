import type { AttestationStatementMap } from '../../cbor/AttestationStatementMap';
import { Fmt } from '../../enums/Fmt';
import type { AttestationHandler } from './AttestationHandler';

export class NoneAttestationHandler implements AttestationHandler {
  readonly attestationFormat = Fmt.NONE;

  /**
   * Handles 'none' attestation (no attestation statement).
   * @see https://www.w3.org/TR/webauthn-3/#sctn-none-attestation
   */
  async createAttestation(): Promise<AttestationStatementMap> {
    // For "none" attestation, the attestation statement is an empty CBOR map
    const attStmt = new Map<never, never>();

    return attStmt;
  }
}
