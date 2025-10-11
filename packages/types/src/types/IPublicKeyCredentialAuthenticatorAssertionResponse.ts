import type { IAuthenticatorAssertionResponse } from './IAuthenticatorAssertionResponse.js';
import type { IPublicKeyCredential } from './IPublicKeyCredential.js';

export interface IPublicKeyCredentialAuthenticatorAssertionResponse
  extends IPublicKeyCredential {
  response: IAuthenticatorAssertionResponse;
}
