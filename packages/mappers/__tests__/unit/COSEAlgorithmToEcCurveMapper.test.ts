import { COSEKeyAlgorithm, KeyCurveName } from '@repo/enums';
import { describe, it, expect } from 'vitest';

import { COSEAlgorithmToKeyCurveNameMapper } from '../../src/COSEAlgorithmToEcCurveMapper';

describe('COSEAlgorithmToEcCurve', () => {
  it('should map ES256 to P256', () => {
    expect(COSEAlgorithmToKeyCurveNameMapper(COSEKeyAlgorithm.ES256)).toBe(
      KeyCurveName.P256,
    );
  });

  it('should map ES384 to P384', () => {
    expect(COSEAlgorithmToKeyCurveNameMapper(COSEKeyAlgorithm.ES384)).toBe(
      KeyCurveName.P384,
    );
  });

  it('should map ES512 to P521', () => {
    expect(COSEAlgorithmToKeyCurveNameMapper(COSEKeyAlgorithm.ES512)).toBe(
      KeyCurveName.P521,
    );
  });

  it('should throw an error for an unknown COSE algorithm', () => {
    const unknownAlgorithm = 999 as COSEKeyAlgorithm;
    expect(() => COSEAlgorithmToKeyCurveNameMapper(unknownAlgorithm)).toThrow();
  });
});
