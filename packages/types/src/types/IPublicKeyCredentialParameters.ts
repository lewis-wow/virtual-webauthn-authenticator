import type {
  COSEAlgorithmIdentifier,
  PublicKeyCredentialType,
} from '@repo/enums';

export interface IPublicKeyCredentialParameters {
  type: PublicKeyCredentialType;
  alg: COSEAlgorithmIdentifier;
}
