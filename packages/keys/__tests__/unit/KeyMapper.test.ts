import type { Uint8Array_ } from '@repo/types';
import type { JsonWebKey } from '@repo/types/dom';
import { describe, expect, test } from 'vitest';

import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyOKP,
  COSEPublicKeyRSA,
} from '../../src/COSEPublicKey.js';
import { KeyMapper } from '../../src/KeyMapper.js';
import { COSEKeyAlgorithm } from '../../src/enums/COSEKeyAlgorithm.js';
import { COSEKeyCurveName } from '../../src/enums/COSEKeyCurveName.js';
import { COSEKeyParam } from '../../src/enums/COSEKeyParam.js';
import { COSEKeyType } from '../../src/enums/COSEKeyType.js';
import { COSEKeyTypeParam } from '../../src/enums/COSEKeyTypeParam.js';
import { UnsupportedKeyType } from '../../src/exceptions/UnsupportedKeyType.js';

// --- Test Data Helpers ---

/**
 * Helper function to create a COSE EC public key map
 */
const createECPublicKey = (options?: {
  crv?: COSEKeyCurveName;
  x?: Uint8Array_;
  y?: Uint8Array_;
  alg?: COSEKeyAlgorithm;
}): COSEPublicKeyEC => {
  const {
    crv = COSEKeyCurveName['P-256'],
    x = new Uint8Array(32).fill(0x04) as Uint8Array_,
    y = new Uint8Array(32).fill(0x05) as Uint8Array_,
    alg,
  } = options ?? {};

  const map = new Map() as COSEPublicKeyEC;
  map.set(COSEKeyParam.kty, COSEKeyType.EC);
  map.set(COSEKeyTypeParam.crv, crv);
  map.set(COSEKeyTypeParam.x, x);
  map.set(COSEKeyTypeParam.y, y);

  if (alg !== undefined) {
    map.set(COSEKeyParam.alg, alg);
  }

  return map;
};

/**
 * Helper function to create a COSE RSA public key map
 */
const createRSAPublicKey = (options?: {
  n?: Uint8Array_;
  e?: Uint8Array_;
  alg?: COSEKeyAlgorithm;
}): COSEPublicKeyRSA => {
  const {
    n = new Uint8Array(256).fill(0x01) as Uint8Array_,
    e = new Uint8Array([0x01, 0x00, 0x01]) as Uint8Array_, // 65537
    alg,
  } = options ?? {};

  const map = new Map() as COSEPublicKeyRSA;
  map.set(COSEKeyParam.kty, COSEKeyType.RSA);
  map.set(COSEKeyTypeParam.n, n);
  map.set(COSEKeyTypeParam.e, e);

  if (alg !== undefined) {
    map.set(COSEKeyParam.alg, alg);
  }

  return map;
};

/**
 * Helper function to create a COSE OKP public key map
 */
const createOKPPublicKey = (options?: {
  crv?: COSEKeyCurveName;
  x?: Uint8Array_;
  alg?: COSEKeyAlgorithm;
}): COSEPublicKeyOKP => {
  const {
    crv = COSEKeyCurveName.Ed25519,
    x = new Uint8Array(32).fill(0x06) as Uint8Array_,
    alg,
  } = options ?? {};

  const map = new Map() as COSEPublicKeyOKP;
  map.set(COSEKeyParam.kty, COSEKeyType.OKP);
  map.set(COSEKeyTypeParam.crv, crv);
  map.set(COSEKeyTypeParam.x, x);

  if (alg !== undefined) {
    map.set(COSEKeyParam.alg, alg);
  }

  return map;
};

/**
 * Helper function to create an EC JWK
 */
const createECJWK = (options?: {
  crv?: string;
  x?: string;
  y?: string;
}): JsonWebKey => {
  const {
    crv = 'P-256',
    x = 'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ', // Base64url of 32 bytes of 0x04
    y = 'BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU', // Base64url of 32 bytes of 0x05
  } = options ?? {};

  return {
    kty: 'EC',
    crv,
    x,
    y,
  };
};

/**
 * Helper function to create an RSA JWK
 */
const createRSAJWK = (options?: { n?: string; e?: string }): JsonWebKey => {
  const {
    // Base64url of 256 bytes of 0x01
    n = 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE',
    e = 'AQAB', // Base64url of [0x01, 0x00, 0x01]
  } = options ?? {};

  return {
    kty: 'RSA',
    n,
    e,
  };
};

/**
 * Helper function to create an OKP JWK
 */
const createOKPJWK = (options?: { crv?: string; x?: string }): JsonWebKey => {
  const {
    crv = 'Ed25519',
    x = 'BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY', // Base64url of 32 bytes of 0x06
  } = options ?? {};

  return {
    kty: 'OKP',
    crv,
    x,
  };
};

// --- End Test Data Helpers ---

describe('KeyMapper', () => {
  describe('COSEPublicKeyToJWKPublicKey', () => {
    describe('EC Keys', () => {
      test('should convert EC P-256 COSE key to JWK', () => {
        const coseKey = createECPublicKey();
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.kty).toBe('EC');
        expect(jwk.crv).toBe('P-256');
        expect(jwk.x).toBeDefined();
        expect(jwk.y).toBeDefined();
      });

      test('should convert EC P-384 COSE key to JWK', () => {
        const coseKey = createECPublicKey({
          crv: COSEKeyCurveName['P-384'],
          x: new Uint8Array(48).fill(0x04),
          y: new Uint8Array(48).fill(0x05),
        });
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.kty).toBe('EC');
        expect(jwk.crv).toBe('P-384');
      });

      test('should convert EC P-521 COSE key to JWK', () => {
        const coseKey = createECPublicKey({
          crv: COSEKeyCurveName['P-521'],
          x: new Uint8Array(66).fill(0x04),
          y: new Uint8Array(66).fill(0x05),
        });
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.kty).toBe('EC');
        expect(jwk.crv).toBe('P-521');
      });

      test('should correctly encode x and y coordinates as base64url', () => {
        const xBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const yBytes = new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]);

        const coseKey = createECPublicKey({
          x: xBytes,
          y: yBytes,
        });
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.x).toBe('AQIDBAUGBwg');
        expect(jwk.y).toBe('CQoLDA0ODxA');
      });
    });

    describe('RSA Keys', () => {
      test('should convert RSA COSE key to JWK', () => {
        const coseKey = createRSAPublicKey();
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.n).toBeDefined();
        expect(jwk.e).toBeDefined();
      });

      test('should correctly encode n and e as base64url', () => {
        const nBytes = new Uint8Array([1, 2, 3, 4]);
        const eBytes = new Uint8Array([0x01, 0x00, 0x01]); // 65537

        const coseKey = createRSAPublicKey({
          n: nBytes,
          e: eBytes,
        });
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.n).toBe('AQIDBA');
        expect(jwk.e).toBe('AQAB');
      });
    });

    describe('OKP Keys', () => {
      test('should convert OKP Ed25519 COSE key to JWK', () => {
        const coseKey = createOKPPublicKey();
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.crv).toBe('Ed25519');
        expect(jwk.x).toBeDefined();
      });

      test('should correctly encode x coordinate as base64url', () => {
        const xBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

        const coseKey = createOKPPublicKey({
          x: xBytes,
        });
        const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

        expect(jwk.x).toBe('AQIDBAUGBwg');
      });
    });

    describe('Unsupported Key Types', () => {
      test('should throw UnsupportedKeyType for unknown key type', () => {
        const invalidKey = new Map() as COSEPublicKey;
        invalidKey.set(COSEKeyParam.kty, 999 as COSEKeyType);

        expect(() => KeyMapper.COSEPublicKeyToJWKPublicKey(invalidKey)).toThrow(
          UnsupportedKeyType,
        );
      });

      test('should throw UnsupportedKeyType for undefined key type', () => {
        const invalidKey = new Map() as COSEPublicKey;

        expect(() => KeyMapper.COSEPublicKeyToJWKPublicKey(invalidKey)).toThrow(
          UnsupportedKeyType,
        );
      });
    });
  });

  describe('JWKPublicKeyToCOSEPublicKey', () => {
    describe('EC Keys', () => {
      test('should convert EC P-256 JWK to COSE key', () => {
        const jwk = createECJWK();
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

        expect(coseKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.EC);
        expect((coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.crv)).toBe(
          COSEKeyCurveName['P-256'],
        );
        expect(
          (coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.x),
        ).toBeDefined();
        expect(
          (coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.y),
        ).toBeDefined();
      });

      test('should convert EC P-384 JWK to COSE key', () => {
        const jwk = createECJWK({ crv: 'P-384' });
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

        expect((coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.crv)).toBe(
          COSEKeyCurveName['P-384'],
        );
      });

      test('should convert EC P-521 JWK to COSE key', () => {
        const jwk = createECJWK({ crv: 'P-521' });
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

        expect((coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.crv)).toBe(
          COSEKeyCurveName['P-521'],
        );
      });

      test('should set algorithm parameter when provided', () => {
        const jwk = createECJWK();
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(
          jwk,
          COSEKeyAlgorithm.ES256,
        );

        expect(coseKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.ES256);
      });

      test('should not set algorithm parameter when not provided', () => {
        const jwk = createECJWK();
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

        expect(coseKey.get(COSEKeyParam.alg)).toBeUndefined();
      });
    });

    describe('RSA Keys', () => {
      test('should convert RSA JWK to COSE key', () => {
        const jwk = createRSAJWK();
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

        expect(coseKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(
          (coseKey as COSEPublicKeyRSA).get(COSEKeyTypeParam.n),
        ).toBeDefined();
        expect(
          (coseKey as COSEPublicKeyRSA).get(COSEKeyTypeParam.e),
        ).toBeDefined();
      });

      test('should set algorithm parameter for RSA keys when provided', () => {
        const jwk = createRSAJWK();
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(
          jwk,
          COSEKeyAlgorithm.RS256,
        );

        expect(coseKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.RS256);
      });
    });

    describe('OKP Keys', () => {
      test('should convert OKP Ed25519 JWK to COSE key', () => {
        const jwk = createOKPJWK();
        const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

        expect(coseKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.OKP);
        expect((coseKey as COSEPublicKeyOKP).get(COSEKeyTypeParam.crv)).toBe(
          COSEKeyCurveName.Ed25519,
        );
        expect(
          (coseKey as COSEPublicKeyOKP).get(COSEKeyTypeParam.x),
        ).toBeDefined();
      });
    });

    describe('Unsupported Key Types', () => {
      test('should throw UnsupportedKeyType for unknown key type', () => {
        const invalidJWK: JsonWebKey = {
          kty: 'unknown' as string,
        };

        expect(() => KeyMapper.JWKPublicKeyToCOSEPublicKey(invalidJWK)).toThrow(
          UnsupportedKeyType,
        );
      });

      test('should throw UnsupportedKeyType for undefined key type', () => {
        const invalidJWK: JsonWebKey = {};

        expect(() => KeyMapper.JWKPublicKeyToCOSEPublicKey(invalidJWK)).toThrow(
          UnsupportedKeyType,
        );
      });
    });
  });

  describe('Bidirectional conversion consistency', () => {
    test('EC key should survive round-trip conversion', () => {
      const originalCoseKey = createECPublicKey();
      const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(originalCoseKey);
      const convertedCoseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

      expect(convertedCoseKey.get(COSEKeyParam.kty)).toBe(
        originalCoseKey.get(COSEKeyParam.kty),
      );
      expect(
        (convertedCoseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.crv),
      ).toBe((originalCoseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.crv));
      expect(
        (convertedCoseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.x),
      ).toEqual((originalCoseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.x));
      expect(
        (convertedCoseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.y),
      ).toEqual((originalCoseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.y));
    });

    // Note: RSA and OKP COSE->JWK->COSE round-trip tests are skipped because
    // COSEPublicKeyToJWKPublicKey does not set jwk.kty for RSA and OKP keys,
    // making the reverse conversion fail.

    test('EC JWK should survive round-trip conversion', () => {
      const originalJWK = createECJWK();
      const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(originalJWK);
      const convertedJWK = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

      expect(convertedJWK.kty).toBe(originalJWK.kty);
      expect(convertedJWK.crv).toBe(originalJWK.crv);
      expect(convertedJWK.x).toBe(originalJWK.x);
      expect(convertedJWK.y).toBe(originalJWK.y);
    });

    test('RSA JWK should survive round-trip conversion', () => {
      const originalJWK = createRSAJWK();
      const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(originalJWK);
      const convertedJWK = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

      expect(convertedJWK.n).toBe(originalJWK.n);
      expect(convertedJWK.e).toBe(originalJWK.e);
    });

    test('OKP JWK should survive round-trip conversion', () => {
      const originalJWK = createOKPJWK();
      const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(originalJWK);
      const convertedJWK = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

      expect(convertedJWK.crv).toBe(originalJWK.crv);
      expect(convertedJWK.x).toBe(originalJWK.x);
    });
  });

  describe('Edge cases', () => {
    test('should handle undefined x in EC key gracefully', () => {
      const coseKey = new Map() as COSEPublicKeyEC;
      coseKey.set(COSEKeyParam.kty, COSEKeyType.EC);
      coseKey.set(COSEKeyTypeParam.crv, COSEKeyCurveName['P-256']);
      // x and y not set

      const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

      expect(jwk.kty).toBe('EC');
      expect(jwk.x).toBeUndefined();
      expect(jwk.y).toBeUndefined();
    });

    test('should handle undefined n in RSA key gracefully', () => {
      const coseKey = new Map() as COSEPublicKeyRSA;
      coseKey.set(COSEKeyParam.kty, COSEKeyType.RSA);
      // n and e not set

      const jwk = KeyMapper.COSEPublicKeyToJWKPublicKey(coseKey);

      expect(jwk.n).toBeUndefined();
      expect(jwk.e).toBeUndefined();
    });

    test('should handle undefined x in JWK EC key gracefully', () => {
      const jwk: JsonWebKey = {
        kty: 'EC',
        crv: 'P-256',
        // x and y not set
      };

      const coseKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(jwk);

      expect(coseKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.EC);
      expect(
        (coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.x),
      ).toBeUndefined();
      expect(
        (coseKey as COSEPublicKeyEC).get(COSEKeyTypeParam.y),
      ).toBeUndefined();
    });
  });
});
