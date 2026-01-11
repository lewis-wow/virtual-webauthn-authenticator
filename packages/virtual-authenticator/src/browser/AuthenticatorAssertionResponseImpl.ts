import type { Uint8Array_ } from '@repo/types';
import type { AuthenticatorAssertionResponse } from '@repo/types/dom';

import { bytesToArrayBuffer } from './helpers';

export type AuthenticatorAssertionResponseImplOptions = {
  clientDataJSON: Uint8Array_;
  authenticatorData: Uint8Array_;
  signature: Uint8Array_;
  userHandle: Uint8Array_ | null;
};

export class AuthenticatorAssertionResponseImpl
  implements AuthenticatorAssertionResponse
{
  public readonly clientDataJSON: ArrayBuffer;
  public readonly authenticatorData: ArrayBuffer;
  public readonly signature: ArrayBuffer;
  public readonly userHandle: ArrayBuffer | null;

  constructor(opts: AuthenticatorAssertionResponseImplOptions) {
    this.clientDataJSON = bytesToArrayBuffer(opts.clientDataJSON);
    this.authenticatorData = bytesToArrayBuffer(opts.authenticatorData);
    this.signature = bytesToArrayBuffer(opts.signature);
    this.userHandle = opts.userHandle
      ? bytesToArrayBuffer(opts.userHandle)
      : null;
  }
}
