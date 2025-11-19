
export class AuthenticatorResponseImpl implements AuthenticatorResponse {
  readonly clientDataJSON: ArrayBuffer;

  constructor(clientDataJSON: ArrayBuffer) {
    this.clientDataJSON = clientDataJSON;
  }
}
