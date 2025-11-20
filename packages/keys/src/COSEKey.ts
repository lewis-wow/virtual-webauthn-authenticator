import { assert, isEnum, isInstanceOf } from 'typanion';

import { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyCurve } from './enums/COSEKeyCurve';
import { COSEKeyCurveParam } from './enums/COSEKeyCurveParam';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyRsaParam } from './enums/COSEKeyRsaParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { CannotParseCOSEKey } from './exceptions/CannotParseCOSEKey';

export type COSEKeyMap = Map<number, string | number | Uint8Array>;

export class COSEKey {
  readonly map: COSEKeyMap;

  constructor(map: COSEKeyMap) {
    if (!COSEKey.canParse(map)) {
      throw new CannotParseCOSEKey();
    }

    this.map = map;
  }

  public static canParse(map: COSEKeyMap): boolean {
    try {
      const kty = map.get(COSEKeyParam.kty);
      assert(kty, isEnum(COSEKeyType));

      const alg = map.get(COSEKeyParam.alg);
      assert(alg, isEnum(COSEKeyAlgorithm));

      switch (kty) {
        case COSEKeyType.EC: {
          const crv = map.get(COSEKeyCurveParam.crv);
          assert(crv, isEnum(COSEKeyCurve));

          const x = map.get(COSEKeyCurveParam.x);
          assert(x, isInstanceOf(Uint8Array));

          const y = map.get(COSEKeyCurveParam.y);
          assert(y, isInstanceOf(Uint8Array));

          if (map.has(COSEKeyCurveParam.d)) {
            const d = map.get(COSEKeyCurveParam.d);
            assert(d, isInstanceOf(Uint8Array));
          }
          break;
        }
        case COSEKeyType.RSA: {
          const n = map.get(COSEKeyRsaParam.n);
          assert(n, isInstanceOf(Uint8Array));

          const e = map.get(COSEKeyRsaParam.e);
          assert(e, isInstanceOf(Uint8Array));
          break;
        }
        default:
          // This should be unreachable due to the first `assert(kty, ...)`
          // NOTE: This should not be a `HTTPException`, as this should be completely unreachable.
          throw new Error(`Unsupported kty: ${kty}`);
      }

      return true;
    } catch {
      return false;
    }
  }
}
