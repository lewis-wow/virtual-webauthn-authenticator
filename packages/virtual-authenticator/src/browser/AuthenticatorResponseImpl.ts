import type { Uint8Array_ } from '@repo/types';
import type { AuthenticatorResponse } from '@repo/types/dom';

import { bytesToArrayBuffer } from './helpers';

export type AuthenticatorResponseImplOptions = {
  clientDataJSON: Uint8Array_;
};

export class AuthenticatorResponseImpl implements AuthenticatorResponse {
  public readonly clientDataJSON: ArrayBuffer;

  constructor(opts: AuthenticatorResponseImplOptions) {
    this.clientDataJSON = bytesToArrayBuffer(opts.clientDataJSON);
  }
}
