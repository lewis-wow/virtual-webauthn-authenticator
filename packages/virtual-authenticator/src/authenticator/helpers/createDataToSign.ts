import type { Uint8Array_ } from '@repo/types';

export type CreateDataToSignArgs = {
  clientDataHash: Uint8Array_;
  authData: Uint8Array_;
};

/**
 * Creates data to be signed: concatenation of authData and clientDataHash.
 * signature = Sign(privateKey, authenticatorData || clientDataHash)
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (Step 11)
 */
export const createDataToSign = (opts: CreateDataToSignArgs): Uint8Array_ => {
  const { clientDataHash, authData } = opts;

  const dataToSign = Buffer.concat([authData, clientDataHash]);

  return new Uint8Array(dataToSign);
};
