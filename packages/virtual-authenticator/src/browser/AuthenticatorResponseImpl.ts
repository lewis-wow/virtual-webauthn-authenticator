import type { AuthenticatorResponse } from '@repo/types/dom';

export type AuthenticatorResponseImplOptions = {
  clientDataJSON: ArrayBuffer;
};

export class AuthenticatorResponseImpl implements AuthenticatorResponse {
  public readonly clientDataJSON: ArrayBuffer;

  constructor(opts: AuthenticatorResponseImplOptions) {
    this.clientDataJSON = opts.clientDataJSON;
  }
}
