import type {
  PublicKeyCredentialType,
  COSEAlgorithmIdentifier,
} from '@repo/enums';

export interface IPublicKeyCredentialParameters {
  type: PublicKeyCredentialType;
  alg: COSEAlgorithmIdentifier;
}
