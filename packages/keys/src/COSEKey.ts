import { assertSchema } from '@repo/assert';
import z from 'zod';

import { COSEKeyCurveParam } from '../enums/COSEKeyCurveParam';
import { COSEKeyParam } from '../enums/COSEKeyParam';
import { COSEKeyRsaParam } from '../enums/COSEKeyRsaParam';
import { COSEKeyType } from '../enums/COSEKeyType';
import { CannotParseCOSEKey } from '../exceptions/CannotParseCOSEKey';
import { UnsupportedKeyType } from '../exceptions/UnsupportedKeyType';
import {
  COSEKeyAlgorithmSchema,
  COSEKeyCurveSchema,
  COSEKeyTypeSchema,
} from '../zod-validation';

export type COSEKeyMap = Map<number, string | number | Uint8Array>;

export class COSEKey {
  readonly map: COSEKeyMap;

  constructor(map: COSEKeyMap) {
    if (!COSEKey.canParse(map)) {
      throw new CannotParseCOSEKey();
    }

    this.map = map;
  }

  /**
   * Returns the Key Type (kty).
   * Guaranteed to exist by the constructor check.
   */
  public getKty(): COSEKeyType {
    return this.map.get(COSEKeyParam.kty) as COSEKeyType;
  }

  /**
   * Returns the Algorithm (alg).
   * Guaranteed to exist by the constructor check.
   */
  public getAlg(): number {
    return this.map.get(COSEKeyParam.alg) as number;
  }

  // --- EC Specific Properties ---

  /**
   * Returns the Curve (crv) if this is an EC key.
   */
  public getCrv(): number | undefined {
    return this.map.get(COSEKeyCurveParam.crv) as number | undefined;
  }

  /**
   * Returns the X Coordinate if this is an EC key.
   */
  public getX(): Uint8Array | undefined {
    return this.map.get(COSEKeyCurveParam.x) as Uint8Array | undefined;
  }

  /**
   * Returns the Y Coordinate if this is an EC key.
   */
  public getY(): Uint8Array | undefined {
    return this.map.get(COSEKeyCurveParam.y) as Uint8Array | undefined;
  }

  /**
   * Returns the Private Key (d) if this is an EC key and it is present.
   */
  public getD(): Uint8Array | undefined {
    return this.map.get(COSEKeyCurveParam.d) as Uint8Array | undefined;
  }

  // --- RSA Specific Properties ---

  /**
   * Returns the Modulus (n) if this is an RSA key.
   */
  public getN(): Uint8Array | undefined {
    return this.map.get(COSEKeyRsaParam.n) as Uint8Array | undefined;
  }

  /**
   * Returns the Exponent (e) if this is an RSA key.
   */
  public getE(): Uint8Array | undefined {
    return this.map.get(COSEKeyRsaParam.e) as Uint8Array | undefined;
  }

  public static canParse(map: COSEKeyMap): boolean {
    try {
      const kty = map.get(COSEKeyParam.kty);
      assertSchema(kty, COSEKeyTypeSchema);

      const alg = map.get(COSEKeyParam.alg);
      assertSchema(alg, COSEKeyAlgorithmSchema);

      switch (kty) {
        case COSEKeyType.EC2: {
          const crv = map.get(COSEKeyCurveParam.crv);
          assertSchema(crv, COSEKeyCurveSchema);

          const x = map.get(COSEKeyCurveParam.x);
          assertSchema(x, z.instanceof(Uint8Array));

          const y = map.get(COSEKeyCurveParam.y);
          assertSchema(y, z.instanceof(Uint8Array));

          if (map.has(COSEKeyCurveParam.d)) {
            const d = map.get(COSEKeyCurveParam.d);
            assertSchema(d, z.instanceof(Uint8Array));
          }
          break;
        }
        case COSEKeyType.RSA: {
          const n = map.get(COSEKeyRsaParam.n);
          assertSchema(n, z.instanceof(Uint8Array));

          const e = map.get(COSEKeyRsaParam.e);
          assertSchema(e, z.instanceof(Uint8Array));
          break;
        }
        default:
          throw new UnsupportedKeyType();
      }

      return true;
    } catch {
      return false;
    }
  }
}
