import type { TypedMap, Uint8Array_ } from '@repo/types';

import type { AttestationStatementMap } from './AttestationStatementMap';

/**
 * Attestation Object structure as defined in WebAuthn specification.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#sctn-makeCred-authnr-alg
 */
export type AttestationObjectMap = TypedMap<{
  /** Attestation Statement Format Identifier (e.g., "none", "packed", "fido-u2f") */
  fmt: string;
  /** Attestation statement - a CBOR map containing attestation-specific data */
  attStmt: AttestationStatementMap;
  /** Authenticator data - raw bytes containing rpIdHash, flags, counter, and optional credential data */
  authData: Uint8Array_;
}>;
