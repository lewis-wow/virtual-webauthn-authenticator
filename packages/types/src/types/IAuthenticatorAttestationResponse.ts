import type { IAuthenticatorResponse } from './IAuthenticatorResponse.js';

/**
 * The authenticator's response during a registration (`webauthn.create`) ceremony.
 * It contains the attestation object used to verify the new credential.
 */
export interface IAuthenticatorAttestationResponse
  extends IAuthenticatorResponse {
  /**
   * The raw binary attestation object, which includes the authenticator data
   * and an attestation statement to prove the authenticator's integrity.
   */
  attestationObject: Buffer;
}
