import { KeyAlgorithm, COSEKeyAlgorithm } from '@repo/enums';
import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';

export const COSEKeyAlgorithmToKeyAlgorithmMapper = (
  coseAlgorithm: COSEKeyAlgorithm,
): KeyAlgorithm => {
  const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);

  return COSE_TO_JWK_ALG[coseAlgorithm];
};
