import type { AuthenticatorAssertionResponse } from '../../validation/spec/AuthenticatorAssertionResponseSchema';
import type { AuthenticatorAttestationResponse } from '../../validation/spec/AuthenticatorAttestationResponseSchema';
import { AuthenticatorAssertionResponseImpl } from '../AuthenticatorAssertionResponseImpl';
import { AuthenticatorAttestationResponseImpl } from '../AuthenticatorAttestationResponseImpl';

export const createPublicKeyCredentialResponseImpl = (
  publicKeyCredentialResponse:
    | AuthenticatorAttestationResponse
    | AuthenticatorAssertionResponse,
):
  | AuthenticatorAttestationResponseImpl
  | AuthenticatorAssertionResponseImpl => {
  if ('attestationObject' in publicKeyCredentialResponse) {
    return new AuthenticatorAttestationResponseImpl({
      attestationObject: publicKeyCredentialResponse.attestationObject,
      clientDataJSON: publicKeyCredentialResponse.clientDataJSON,
      transports: publicKeyCredentialResponse.transports,
    });
  } else {
    return new AuthenticatorAssertionResponseImpl({
      authenticatorData: publicKeyCredentialResponse.authenticatorData,
      clientDataJSON: publicKeyCredentialResponse.clientDataJSON,
      signature: publicKeyCredentialResponse.signature,
      userHandle: publicKeyCredentialResponse.userHandle ?? null,
    });
  }
};
