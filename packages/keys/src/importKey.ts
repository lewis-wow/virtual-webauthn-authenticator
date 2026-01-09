import { webcrypto } from 'node:crypto';

export const importKey = async (opts: {
  keyData: webcrypto.JsonWebKey;
  algorithm:
    | webcrypto.AlgorithmIdentifier
    | webcrypto.RsaHashedImportParams
    | webcrypto.EcKeyImportParams;
}) => {
  const { keyData, algorithm } = opts;

  return await webcrypto.subtle.importKey('jwk', keyData, algorithm, false, [
    'verify',
  ]);
};
