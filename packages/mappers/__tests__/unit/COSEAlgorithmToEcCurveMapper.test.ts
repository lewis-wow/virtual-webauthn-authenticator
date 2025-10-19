import { COSEAlgorithm, EcCurve } from '@repo/enums';
import { describe, it, expect } from 'vitest';

import { COSEAlgorithmToEcCurveMapper } from '../../src/COSEAlgorithmToEcCurveMapper';

describe('COSEAlgorithmToEcCurve', () => {
  it('should map ES256 to P256', () => {
    expect(COSEAlgorithmToEcCurveMapper(COSEAlgorithm.ES256)).toBe(
      EcCurve.P256,
    );
  });

  it('should map ES384 to P384', () => {
    expect(COSEAlgorithmToEcCurveMapper(COSEAlgorithm.ES384)).toBe(
      EcCurve.P384,
    );
  });

  it('should map ES512 to P521', () => {
    expect(COSEAlgorithmToEcCurveMapper(COSEAlgorithm.ES512)).toBe(
      EcCurve.P521,
    );
  });

  it('should throw an error for an unknown COSE algorithm', () => {
    const unknownAlgorithm = 999 as COSEAlgorithm;
    expect(() => COSEAlgorithmToEcCurveMapper(unknownAlgorithm)).toThrow();
  });
});
