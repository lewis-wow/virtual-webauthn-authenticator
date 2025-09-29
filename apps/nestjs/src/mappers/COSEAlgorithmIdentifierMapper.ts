import { COSEAlgorithmIdentifier } from '../enums/COSEAlgorithmIdentifier.js';
import {
  KnownKeyTypes as KnownJsonWebKeyType,
  KnownKeyCurveNames as KnownJsonWebKeyCurveName,
} from '@azure/keyvault-keys';

/**
 * A mapper for converting COSE algorithm identifiers to other formats.
 */
export class COSEAlgorithmIdentifierMapper {
  /**
   * Converts a COSE algorithm identifier to its corresponding JSON Web Key type.
   * @param {COSEAlgorithmIdentifier} algorithm - The numeric COSE algorithm identifier.
   * @returns {KnownJsonWebKeyType} The matching JSON Web Key type ('EC' or 'RSA').
   * @throws {Error} If the algorithm identifier is unknown or unsupported.
   */
  static toKnownJsonWebKeyType(
    algorithm: COSEAlgorithmIdentifier,
  ): KnownJsonWebKeyType.EC | KnownJsonWebKeyType.RSA {
    switch (algorithm) {
      // Elliptic Curve Algorithms
      case COSEAlgorithmIdentifier.ES256:
      case COSEAlgorithmIdentifier.ES384:
      case COSEAlgorithmIdentifier.ES512:
      case COSEAlgorithmIdentifier.EdDSA:
        return KnownJsonWebKeyType.EC;

      // RSA Algorithms
      case COSEAlgorithmIdentifier.PS256:
      case COSEAlgorithmIdentifier.PS384:
      case COSEAlgorithmIdentifier.PS512:
      case COSEAlgorithmIdentifier.RS256:
      case COSEAlgorithmIdentifier.RS384:
      case COSEAlgorithmIdentifier.RS512:
      case COSEAlgorithmIdentifier.RS1:
        return KnownJsonWebKeyType.RSA;

      default:
        throw new Error(`Unsupported COSE algorithm identifier: ${algorithm}`);
    }
  }

  /**
   * Converts a COSE algorithm identifier to its corresponding JSON Web Key curve name.
   * @param {COSEAlgorithmIdentifier} algorithm - The numeric COSE algorithm identifier.
   * @returns {KnownJsonWebKeyCurveName} The matching curve name for ECDSA algorithms, or undefined for others.
   */
  static toKnownJsonWebKeyCurveName(
    algorithm: COSEAlgorithmIdentifier,
  ): KnownJsonWebKeyCurveName | undefined {
    switch (algorithm) {
      case COSEAlgorithmIdentifier.ES256:
        return KnownJsonWebKeyCurveName.P256;
      case COSEAlgorithmIdentifier.ES384:
        return KnownJsonWebKeyCurveName.P384;
      case COSEAlgorithmIdentifier.ES512:
        return KnownJsonWebKeyCurveName.P521;
      default:
        return undefined;
    }
  }
}
