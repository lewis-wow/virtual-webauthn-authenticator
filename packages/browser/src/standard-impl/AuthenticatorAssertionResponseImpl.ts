export class AuthenticatorAssertionResponseImpl
  implements AuthenticatorAssertionResponse
{
  clientDataJSON: ArrayBuffer;
  authenticatorData: ArrayBuffer;
  signature: ArrayBuffer;
  userHandle: ArrayBuffer | null;

  constructor(opts: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer | null;
  }) {
    this.clientDataJSON = opts.clientDataJSON;
    this.authenticatorData = opts.authenticatorData;
    this.signature = opts.signature;
    this.userHandle = opts.userHandle;
  }
}
