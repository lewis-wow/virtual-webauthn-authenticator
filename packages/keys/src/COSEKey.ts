import { assertSchema } from '@repo/assert';
import z from 'zod';

import { COSEKeyCurveParam } from './enums/COSEKeyCurveParam';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyRsaParam } from './enums/COSEKeyRsaParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { CannotParseCOSEKey } from './exceptions/CannotParseCOSEKey';
import {
  COSEKeyAlgorithmSchema,
  COSEKeyCurveSchema,
  COSEKeyTypeSchema,
} from './zod-validation';

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
      assertSchema(kty, COSEKeyTypeSchema);

      const alg = map.get(COSEKeyParam.alg);
      assertSchema(alg, COSEKeyAlgorithmSchema);

      switch (kty) {
        case COSEKeyType.EC: {
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
