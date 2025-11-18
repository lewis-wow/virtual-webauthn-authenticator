import { MethodNotImplemented } from './exceptions/MethodNotImplemented';

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

  toJSON() {
    throw new MethodNotImplemented();
  }

  getClientExtensionResults(): AuthenticationExtensionsClientOutputs {
    return {};
  }
}
