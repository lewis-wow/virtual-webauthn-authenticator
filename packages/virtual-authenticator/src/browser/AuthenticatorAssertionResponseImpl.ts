import type { AuthenticatorAssertionResponse } from '@repo/types/dom';

export class AuthenticatorAssertionResponseImpl
  implements AuthenticatorAssertionResponse
{
  public readonly clientDataJSON: ArrayBuffer;
  public readonly authenticatorData: ArrayBuffer;
  public readonly signature: ArrayBuffer;
  public readonly userHandle: ArrayBuffer | null;

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
