import type { COSEAlgorithm, PublicKeyCredentialType } from '@repo/enums';

export interface IPublicKeyCredentialParameters {
  type: PublicKeyCredentialType;
  alg: COSEAlgorithm;
}
