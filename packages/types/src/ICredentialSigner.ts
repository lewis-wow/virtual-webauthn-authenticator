import type { MaybePromise } from './MaybePromise.js';

export interface ICredentialSigner {
  sign: (data: Buffer) => MaybePromise<Buffer>;
}
