import type {
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
  AuthenticationExtensionsClientOutputs,
  PublicKeyCredential,
} from './types';

export class PublicKeyCredentialImpl implements PublicKeyCredential {
  readonly id: string;
  readonly rawId: ArrayBuffer;
  readonly type: 'public-key';
  readonly response:
    | AuthenticatorAttestationResponse
    | AuthenticatorAssertionResponse;
  readonly authenticatorAttachment: string | null;

  constructor(opts: {
    id: string;
    rawId: ArrayBuffer;
    response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
    authenticatorAttachment: string | null;
  }) {
    this.id = opts.id;
    this.rawId = opts.rawId;
    this.type = 'public-key';
    this.response = opts.response;
    this.authenticatorAttachment = opts.authenticatorAttachment;
  }

  getClientExtensionResults(): AuthenticationExtensionsClientOutputs {
    return {};
  }
}
