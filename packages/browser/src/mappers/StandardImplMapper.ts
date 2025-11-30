import type {
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
  PublicKeyCredential as VirtualAuthenticatorPublicKeyCredential,
} from '@repo/virtual-authenticator/zod-validation';

import {
  AuthenticatorAssertionResponseImpl,
  AuthenticatorAttestationResponseImpl,
  PublicKeyCredentialImpl,
} from '../standard-impl';

export class StandardImplMapper {
  static publicKeyCredentialToStandardImpl(
    publicKeyCredential: VirtualAuthenticatorPublicKeyCredential,
  ): PublicKeyCredentialImpl {
    const response = StandardImplMapper.responseToStandardImpl(
      publicKeyCredential.response,
    );

    return new PublicKeyCredentialImpl({
      id: publicKeyCredential.id,
      rawId: publicKeyCredential.rawId.slice().buffer,
      response,
      authenticatorAttachment: null,
    });
  }

  static responseToStandardImpl(
    response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse,
  ): AuthenticatorAttestationResponseImpl | AuthenticatorAssertionResponseImpl {
    if ('attestationObject' in response) {
      return new AuthenticatorAttestationResponseImpl({
        attestationObject: response.attestationObject.slice().buffer,
        clientDataJSON: response.clientDataJSON.slice().buffer,
      });
    }

    return new AuthenticatorAssertionResponseImpl({
      ...response,
      authenticatorData: response.authenticatorData.slice().buffer,
      clientDataJSON: response.clientDataJSON.slice().buffer,
      signature: response.signature.slice().buffer,
      userHandle: response.userHandle
        ? response.userHandle.slice().buffer
        : null,
    });
  }
}
