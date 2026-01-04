import type { IAttestationStatementMap } from './IAttestationStatementMap';

/**
 * Attestation Object structure as defined in WebAuthn specification.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 */
export interface IAttestationObjectMap extends Map<string, unknown> {
  /** Attestation Statement Format Identifier (e.g., "none", "packed", "fido-u2f") */
  get(key: 'fmt'): string;

  /** Attestation statement - a CBOR map containing attestation-specific data */
  get(key: 'attStmt'): IAttestationStatementMap;

  /** Authenticator data - raw bytes containing rpIdHash, flags, counter, and optional credential data */
  get(key: 'authData'): Uint8Array;
}
