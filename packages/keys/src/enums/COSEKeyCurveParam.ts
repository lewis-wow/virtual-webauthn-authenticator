import type { ValueOfEnum } from '@repo/types';

/**
 * COSE EC Key Parameters.
 *
 * Defines the integer keys used for EC (Elliptic Curve) specific parameters in a COSE Key map.
 *
 * **Table: EC Key Parameters**
 *
 * * **crv** (label: `-1`, type: `int` / `tstr`) - The identifier of the curve (e.g., P-256).
 * * **x** (label: `-2`, type: `bstr`) - The x-coordinate of the curve point.
 * * **y** (label: `-3`, type: `bstr` / `bool`) - The y-coordinate or sign bit.
 * * **d** (label: `-4`, type: `bstr`) - The private key.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8152#section-13.1.1
 */
export const COSEKeyCurveParam = {
  /**
   * EC Curve identifier (crv).
   * Takes an integer or string value identifying the curve (e.g., 1 for P-256).
   */
  crv: -1,

  /**
   * X Coordinate (x).
   * Contains the x-coordinate of the curve point.
   */
  x: -2,

  /**
   * Y Coordinate (y).
   * Contains the y-coordinate of the curve point, or a boolean for point compression.
   */
  y: -3,

  /**
   * Private Key (d).
   * Contains the private key value.
   */
  d: -4,
} as const;

export type COSEKeyCurveParam = ValueOfEnum<typeof COSEKeyCurveParam>;
