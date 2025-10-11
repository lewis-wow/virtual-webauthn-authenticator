import type { PublicKeyCredentialType } from './PublicKeyCredentialType.js';
import type { COSEAlgorithmIdentifier } from './COSEAlgorithmIdentifier.js';

export interface IPublicKeyCredentialParameters {
  type: PublicKeyCredentialType;
  alg: COSEAlgorithmIdentifier;
}
