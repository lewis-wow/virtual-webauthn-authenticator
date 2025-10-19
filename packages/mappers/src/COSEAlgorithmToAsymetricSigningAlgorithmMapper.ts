import { AsymetricSigningAlgorithm, COSEAlgorithm } from '@repo/enums';
import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';

export const COSEAlgorithmToAsymetricSigningAlgorithmMapper = (
  coseAlgorithm: COSEAlgorithm,
): AsymetricSigningAlgorithm => {
  const COSE_TO_JWK_ALG = swapKeysAndValues(COSEAlgorithm);

  return COSE_TO_JWK_ALG[coseAlgorithm];
};
