import type { MaybePromise } from '@repo/types';

export type CredentialSigner = {
  sign: (data: Buffer) => MaybePromise<Buffer>;
};
