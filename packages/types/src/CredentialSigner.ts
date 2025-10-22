import type { MaybePromise } from '@repo/types';

export interface CredentialSigner {
  sign: (data: Buffer) => MaybePromise<Uint8Array>;
}
