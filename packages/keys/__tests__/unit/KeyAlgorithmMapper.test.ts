import { describe, expect, test } from 'vitest';

import { KeyAlgorithmMapper } from '../../src/KeyAlgorithmMapper.js';
import { COSEKeyAlgorithm } from '../../src/enums/COSEKeyAlgorithm.js';
import { JWKKeyAlgorithm } from '../../src/enums/JWKKeyAlgorithm.js';
import { JWKKeyCurveName } from '../../src/enums/JWKKeyCurveName.js';
import { JWKKeyType } from '../../src/enums/JWKKeyType.js';
import { SubtleCryptoAlg } from '../../src/enums/SubtleCryptoAlg.js';
import { SubtleCryptoKeyAlgName } from '../../src/enums/SubtleCryptoKeyAlgName.js';

describe('KeyAlgorithmMapper', () => {
  describe('JWKKeyAlgorithmToCOSEKeyAlgorithm', () => {
    test('should convert ES256 to COSE -7', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.ES256,
      );
      expect(result).toBe(-7);
    });

    test('should convert ES384 to COSE -35', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.ES384,
      );
      expect(result).toBe(-35);
    });

    test('should convert ES512 to COSE -36', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.ES512,
      );
      expect(result).toBe(-36);
    });

    test('should convert RS256 to COSE -257', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.RS256,
      );
      expect(result).toBe(-257);
    });

    test('should convert RS384 to COSE -258', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.RS384,
      );
      expect(result).toBe(-258);
    });

    test('should convert RS512 to COSE -259', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.RS512,
      );
      expect(result).toBe(-259);
    });

    test('should convert PS256 to COSE -37', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.PS256,
      );
      expect(result).toBe(-37);
    });

    test('should convert PS384 to COSE -38', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.PS384,
      );
      expect(result).toBe(-38);
    });

    test('should convert PS512 to COSE -39', () => {
      const result = KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        JWKKeyAlgorithm.PS512,
      );
      expect(result).toBe(-39);
    });
  });

  describe('COSEKeyAlgorithmToJWKKeyAlgorithm', () => {
    test('should convert COSE -7 to ES256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.ES256,
      );
      expect(result).toBe(JWKKeyAlgorithm.ES256);
    });

    test('should convert COSE -35 to ES384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.ES384,
      );
      expect(result).toBe(JWKKeyAlgorithm.ES384);
    });

    test('should convert COSE -36 to ES512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.ES512,
      );
      expect(result).toBe(JWKKeyAlgorithm.ES512);
    });

    test('should convert COSE -257 to RS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.RS256,
      );
      expect(result).toBe(JWKKeyAlgorithm.RS256);
    });

    test('should convert COSE -258 to RS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.RS384,
      );
      expect(result).toBe(JWKKeyAlgorithm.RS384);
    });

    test('should convert COSE -259 to RS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.RS512,
      );
      expect(result).toBe(JWKKeyAlgorithm.RS512);
    });

    test('should convert COSE -37 to PS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.PS256,
      );
      expect(result).toBe(JWKKeyAlgorithm.PS256);
    });

    test('should convert COSE -38 to PS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.PS384,
      );
      expect(result).toBe(JWKKeyAlgorithm.PS384);
    });

    test('should convert COSE -39 to PS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEKeyAlgorithm.PS512,
      );
      expect(result).toBe(JWKKeyAlgorithm.PS512);
    });
  });

  describe('COSEKeyAlgorithmToJWKKeyCurveName', () => {
    test('should return P-256 for ES256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
        COSEKeyAlgorithm.ES256,
      );
      expect(result).toBe(JWKKeyCurveName['P-256']);
    });

    test('should return P-384 for ES384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
        COSEKeyAlgorithm.ES384,
      );
      expect(result).toBe(JWKKeyCurveName['P-384']);
    });

    test('should return P-521 for ES512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
        COSEKeyAlgorithm.ES512,
      );
      expect(result).toBe(JWKKeyCurveName['P-521']);
    });

    test('should return undefined for RS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
        COSEKeyAlgorithm.RS256,
      );
      expect(result).toBeUndefined();
    });

    test('should return undefined for PS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
        COSEKeyAlgorithm.PS256,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('COSEKeyAlgorithmToRSAKeySize', () => {
    test('should return 2048 for RS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.RS256,
      );
      expect(result).toBe(2048);
    });

    test('should return 3072 for RS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.RS384,
      );
      expect(result).toBe(3072);
    });

    test('should return 4096 for RS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.RS512,
      );
      expect(result).toBe(4096);
    });

    test('should return 2048 for PS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.PS256,
      );
      expect(result).toBe(2048);
    });

    test('should return 3072 for PS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.PS384,
      );
      expect(result).toBe(3072);
    });

    test('should return 4096 for PS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.PS512,
      );
      expect(result).toBe(4096);
    });

    test('should return undefined for ES256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.ES256,
      );
      expect(result).toBeUndefined();
    });

    test('should return undefined for ES384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
        COSEKeyAlgorithm.ES384,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('COSEKeyAlgorithmToJWKKeyType', () => {
    test('should return EC for ES256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.ES256,
      );
      expect(result).toBe(JWKKeyType.EC);
    });

    test('should return EC for ES384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.ES384,
      );
      expect(result).toBe(JWKKeyType.EC);
    });

    test('should return EC for ES512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.ES512,
      );
      expect(result).toBe(JWKKeyType.EC);
    });

    test('should return RSA for RS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.RS256,
      );
      expect(result).toBe(JWKKeyType.RSA);
    });

    test('should return RSA for RS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.RS384,
      );
      expect(result).toBe(JWKKeyType.RSA);
    });

    test('should return RSA for RS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.RS512,
      );
      expect(result).toBe(JWKKeyType.RSA);
    });

    test('should return RSA for PS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.PS256,
      );
      expect(result).toBe(JWKKeyType.RSA);
    });

    test('should return RSA for PS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.PS384,
      );
      expect(result).toBe(JWKKeyType.RSA);
    });

    test('should return RSA for PS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        COSEKeyAlgorithm.PS512,
      );
      expect(result).toBe(JWKKeyType.RSA);
    });
  });

  describe('COSEKeyAlgorithmToSubtleCryptoAlg', () => {
    test('should return SHA-256 for ES256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.ES256,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-256']);
    });

    test('should return SHA-256 for RS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.RS256,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-256']);
    });

    test('should return SHA-256 for PS256', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.PS256,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-256']);
    });

    test('should return SHA-384 for ES384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.ES384,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-384']);
    });

    test('should return SHA-384 for RS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.RS384,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-384']);
    });

    test('should return SHA-384 for PS384', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.PS384,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-384']);
    });

    test('should return SHA-512 for ES512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.ES512,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-512']);
    });

    test('should return SHA-512 for RS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.RS512,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-512']);
    });

    test('should return SHA-512 for PS512', () => {
      const result = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(
        COSEKeyAlgorithm.PS512,
      );
      expect(result).toBe(SubtleCryptoAlg['SHA-512']);
    });
  });

  describe('COSEKeyAlgorithmToSubtleCryptoKeyAlgName', () => {
    test('should return ECDSA for ES256', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.ES256,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName.ECDSA);
    });

    test('should return ECDSA for ES384', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.ES384,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName.ECDSA);
    });

    test('should return ECDSA for ES512', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.ES512,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName.ECDSA);
    });

    test('should return RSASSA-PKCS1-v1_5 for RS256', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.RS256,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5']);
    });

    test('should return RSASSA-PKCS1-v1_5 for RS384', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.RS384,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5']);
    });

    test('should return RSASSA-PKCS1-v1_5 for RS512', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.RS512,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5']);
    });

    test('should return RSA-PSS for PS256', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.PS256,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName['RSA-PSS']);
    });

    test('should return RSA-PSS for PS384', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.PS384,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName['RSA-PSS']);
    });

    test('should return RSA-PSS for PS512', () => {
      const result =
        KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
          COSEKeyAlgorithm.PS512,
        );
      expect(result).toBe(SubtleCryptoKeyAlgName['RSA-PSS']);
    });
  });

  describe('Bidirectional conversion consistency', () => {
    const algorithms: JWKKeyAlgorithm[] = [
      JWKKeyAlgorithm.ES256,
      JWKKeyAlgorithm.ES384,
      JWKKeyAlgorithm.ES512,
      JWKKeyAlgorithm.RS256,
      JWKKeyAlgorithm.RS384,
      JWKKeyAlgorithm.RS512,
      JWKKeyAlgorithm.PS256,
      JWKKeyAlgorithm.PS384,
      JWKKeyAlgorithm.PS512,
    ];

    test.each(algorithms)(
      'should convert %s to COSE and back to JWK',
      (jwkAlg) => {
        const coseAlg =
          KeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(jwkAlg);
        const backToJwk =
          KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(coseAlg);
        expect(backToJwk).toBe(jwkAlg);
      },
    );
  });
});
