export class AuthenticatorResponseImpl implements AuthenticatorResponse {
  public readonly clientDataJSON: ArrayBuffer;

  constructor(clientDataJSON: ArrayBuffer) {
    this.clientDataJSON = clientDataJSON;
  }
}
