import type { IAuthenticatorAttestationResponse } from './IAuthenticatorAttestationResponse.js';
import type { IPublicKeyCredential } from './IPublicKeyCredential.js';

export interface IPublicKeyCredentialAuthenticatorAttestationResponse
  extends IPublicKeyCredential {
  response: IAuthenticatorAttestationResponse;
}
