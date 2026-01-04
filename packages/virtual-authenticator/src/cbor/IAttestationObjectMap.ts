import type { TypedMap } from '@repo/types';

import type { IAttestationStatementMap } from './IAttestationStatementMap';

/**
 * Attestation Object structure as defined in WebAuthn specification.
 * @see https://www.w3.org/TR/webauthn-3/#sctn-attestation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAttestationObjectMap
  extends TypedMap<{
    /** Attestation Statement Format Identifier (e.g., "none", "packed", "fido-u2f") */
    fmt: string;
    /** Attestation statement - a CBOR map containing attestation-specific data */
    attStmt: IAttestationStatementMap;
    /** Authenticator data - raw bytes containing rpIdHash, flags, counter, and optional credential data */
    authData: Uint8Array;
  }> {}
