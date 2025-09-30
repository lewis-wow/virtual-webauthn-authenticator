import { CoseAlgorithmIdentifier } from '@repo/enums';
import {
  KnownKeyTypes as KnownJsonWebKeyType,
  KnownKeyCurveNames as KnownJsonWebKeyCurveName,
  KnownSignatureAlgorithms as KnownJsonWebKeySignatureAlgorithm,
} from '@azure/keyvault-keys';

export class CoseAlgorithmIdentifierMapper {
  static toKnownJsonWebKeyType(
    algorithm: CoseAlgorithmIdentifier,
  ): KnownJsonWebKeyType.EC | KnownJsonWebKeyType.RSA {
    switch (algorithm) {
      case CoseAlgorithmIdentifier.ES256:
      case CoseAlgorithmIdentifier.ES384:
      case CoseAlgorithmIdentifier.ES512:
      case CoseAlgorithmIdentifier.EdDSA:
        return KnownJsonWebKeyType.EC;

      case CoseAlgorithmIdentifier.PS256:
      case CoseAlgorithmIdentifier.PS384:
      case CoseAlgorithmIdentifier.PS512:
      case CoseAlgorithmIdentifier.RS256:
      case CoseAlgorithmIdentifier.RS384:
      case CoseAlgorithmIdentifier.RS512:
      case CoseAlgorithmIdentifier.RS1:
        return KnownJsonWebKeyType.RSA;

      default:
        throw new Error(`Unsupported COSE algorithm identifier: ${algorithm}`);
    }
  }

  static toKnownJsonWebKeyCurveName(
    algorithm: CoseAlgorithmIdentifier,
  ): KnownJsonWebKeyCurveName | undefined {
    switch (algorithm) {
      case CoseAlgorithmIdentifier.ES256:
        return KnownJsonWebKeyCurveName.P256;
      case CoseAlgorithmIdentifier.ES384:
        return KnownJsonWebKeyCurveName.P384;
      case CoseAlgorithmIdentifier.ES512:
        return KnownJsonWebKeyCurveName.P521;
      default:
        return undefined;
    }
  }

  static toKnownJsonWebKeySignatureAlgorithm(
    algorithm: CoseAlgorithmIdentifier,
  ): KnownJsonWebKeySignatureAlgorithm {
    switch (algorithm) {
      case CoseAlgorithmIdentifier.ES256:
        return KnownJsonWebKeySignatureAlgorithm.ES256;
      case CoseAlgorithmIdentifier.ES384:
        return KnownJsonWebKeySignatureAlgorithm.ES384;
      case CoseAlgorithmIdentifier.ES512:
        return KnownJsonWebKeySignatureAlgorithm.ES512;
      case CoseAlgorithmIdentifier.PS256:
        return KnownJsonWebKeySignatureAlgorithm.PS256;
      case CoseAlgorithmIdentifier.PS384:
        return KnownJsonWebKeySignatureAlgorithm.PS384;
      case CoseAlgorithmIdentifier.PS512:
        return KnownJsonWebKeySignatureAlgorithm.PS512;
      case CoseAlgorithmIdentifier.RS256:
        return KnownJsonWebKeySignatureAlgorithm.RS256;
      case CoseAlgorithmIdentifier.RS384:
        return KnownJsonWebKeySignatureAlgorithm.RS384;
      case CoseAlgorithmIdentifier.RS512:
        return KnownJsonWebKeySignatureAlgorithm.RS512;

      // Note: EdDSA and RS1 are valid COSE algorithms but are not included in
      // the KnownJsonWebKeySignatureAlgorithm enum from Azure Key Vault.
      default:
        throw new Error(
          `Unsupported or unmappable COSE algorithm identifier for signature: ${algorithm}`,
        );
    }
  }
}
