import { assertSchema } from '@repo/assert';
import z from 'zod';

import type { IKey } from '../IKey';
import { UnsupportedKeyType } from '../exceptions/UnsupportedKeyType';
import {
  COSEKeyAlgorithmSchema,
  COSEKeyCurveSchema,
  COSEKeyTypeSchema,
} from '../zod-validation';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { CannotParseCOSEKey } from './exceptions/CannotParseCOSEKey';

export type COSEKeyMap = Map<number, unknown>;

export class COSEKey implements IKey {
  readonly map: COSEKeyMap;

  constructor(map: COSEKeyMap) {
    if (!COSEKey.canParse(map)) {
      throw new CannotParseCOSEKey();
    }

    this.map = map;
  }

  // --- Common Parameters ---

  /**
   * Returns the Key Type (kty).
   * Guaranteed to exist by the constructor check.
   */
  public getKty(): COSEKeyType {
    return this.map.get(COSEKeyParam.kty) as COSEKeyType;
  }

  /**
   * Returns the Key ID (kid) if present.
   */
  public getKid(): string | undefined {
    return this.map.get(COSEKeyParam.kid) as string | undefined;
  }

  /**
   * Returns the Algorithm (alg).
   * Guaranteed to exist by the constructor check.
   */
  public getAlg(): number {
    return this.map.get(COSEKeyParam.alg) as number;
  }

  /**
   * Returns the Key Operations (key_ops) if present.
   */
  public getKeyOps(): (string | number)[] | undefined {
    return this.map.get(COSEKeyParam.key_ops) as
      | (string | number)[]
      | undefined;
  }

  /**
   * Returns the Base IV (base_iv) if present.
   */
  public getBaseIV(): string | undefined {
    return this.map.get(COSEKeyParam.base_iv) as string | undefined;
  }

  // --- OKP (Octet Key Pair) Specific Properties ---

  /** Returns OKP Curve (crv) */
  public getOkpCrv(): number | undefined {
    return this.map.get(COSEKeyTypeParam.OKP_crv) as number | undefined;
  }

  /** Returns OKP Public Key (x) */
  public getOkpX(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.OKP_x) as Uint8Array | undefined;
  }

  /** Returns OKP Private Key (d) */
  public getOkpD(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.OKP_d) as Uint8Array | undefined;
  }

  // --- EC2 (Elliptic Curve) Specific Properties ---

  /** Returns EC2 Curve (crv) */
  public getEcCrv(): number | undefined {
    return this.map.get(COSEKeyTypeParam.EC2_crv) as number | undefined;
  }

  /** Returns EC2 X Coordinate (x) */
  public getEcX(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.EC2_x) as Uint8Array | undefined;
  }

  /** Returns EC2 Y Coordinate (y) */
  public getEcY(): Uint8Array | boolean | undefined {
    // Note: y can be a boolean (sign bit) for compressed points
    return this.map.get(COSEKeyTypeParam.EC2_y) as
      | Uint8Array
      | boolean
      | undefined;
  }

  /** Returns EC2 Private Key (d) */
  public getEcD(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.EC2_d) as Uint8Array | undefined;
  }

  // --- RSA Specific Properties ---

  /** Returns RSA Modulus (n) */
  public getRsaN(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_n) as Uint8Array | undefined;
  }

  /** Returns RSA Public Exponent (e) */
  public getRsaE(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_e) as Uint8Array | undefined;
  }

  /** Returns RSA Private Exponent (d) */
  public getRsaD(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_d) as Uint8Array | undefined;
  }

  /** Returns RSA Secret Prime p */
  public getRsaP(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_p) as Uint8Array | undefined;
  }

  /** Returns RSA Secret Prime q */
  public getRsaQ(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_q) as Uint8Array | undefined;
  }

  /** Returns RSA dP (d mod (p - 1)) */
  public getRsaDp(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_dP) as Uint8Array | undefined;
  }

  /** Returns RSA dQ (d mod (q - 1)) */
  public getRsaDq(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_dQ) as Uint8Array | undefined;
  }

  /** Returns RSA qInv (CRT coefficient) */
  public getRsaQInv(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_qInv) as Uint8Array | undefined;
  }

  /** Returns RSA Other Prime Infos (array of maps) */
  public getRsaOther(): unknown[] | undefined {
    return this.map.get(COSEKeyTypeParam.RSA_other) as unknown[] | undefined;
  }

  // --- Symmetric Key Properties ---

  /** Returns Symmetric Key Value (k) */
  public getSymmetricK(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.Symmetric_k) as Uint8Array | undefined;
  }

  // --- HSS-LMS Specific Properties ---

  /** Returns HSS-LMS Public Key (pub) */
  public getHssLmsPub(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.HSS_LMS_pub) as Uint8Array | undefined;
  }

  // --- WalnutDSA Specific Properties ---

  /** Returns WalnutDSA Group and Matrix size (N) */
  public getWalnutDsaN(): number | undefined {
    return this.map.get(COSEKeyTypeParam.WalnutDSA_N) as number | undefined;
  }

  /** Returns WalnutDSA Finite Field (q) */
  public getWalnutDsaQ(): number | undefined {
    return this.map.get(COSEKeyTypeParam.WalnutDSA_q) as number | undefined;
  }

  /** Returns WalnutDSA List of T-values */
  public getWalnutDsaTValues(): number[] | undefined {
    return this.map.get(COSEKeyTypeParam.WalnutDSA_t_values) as
      | number[]
      | undefined;
  }

  /** Returns WalnutDSA Matrix 1 */
  public getWalnutDsaMatrix1(): number[][] | undefined {
    return this.map.get(COSEKeyTypeParam.WalnutDSA_matrix_1) as
      | number[][]
      | undefined;
  }

  /** Returns WalnutDSA Permutation 1 */
  public getWalnutDsaPermutation1(): number[] | undefined {
    return this.map.get(COSEKeyTypeParam.WalnutDSA_permutation_1) as
      | number[]
      | undefined;
  }

  /** Returns WalnutDSA Matrix 2 */
  public getWalnutDsaMatrix2(): number[][] | undefined {
    return this.map.get(COSEKeyTypeParam.WalnutDSA_matrix_2) as
      | number[][]
      | undefined;
  }

  // --- Dilithium (AKP) Specific Properties ---

  /** Returns Dilithium Public Key (pub) */
  public getDilithiumPub(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.Dilithium_pub) as
      | Uint8Array
      | undefined;
  }

  /** Returns Dilithium Private Key (priv) */
  public getDilithiumPriv(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.Dilithium_priv) as
      | Uint8Array
      | undefined;
  }

  public static canParse(map: COSEKeyMap): boolean {
    try {
      const kty = map.get(COSEKeyParam.kty);
      assertSchema(kty, COSEKeyTypeSchema);

      const alg = map.get(COSEKeyParam.alg);
      assertSchema(alg, COSEKeyAlgorithmSchema);

      switch (kty) {
        case COSEKeyType.EC2: {
          const crv = map.get(COSEKeyTypeParam.EC2_crv);
          assertSchema(crv, COSEKeyCurveSchema);

          const x = map.get(COSEKeyTypeParam.EC2_x);
          assertSchema(x, z.instanceof(Uint8Array));

          const y = map.get(COSEKeyTypeParam.EC2_y);
          // Y can be bytes or boolean (compressed)
          assertSchema(y, z.union([z.instanceof(Uint8Array), z.boolean()]));

          if (map.has(COSEKeyTypeParam.EC2_d)) {
            const d = map.get(COSEKeyTypeParam.EC2_d);
            assertSchema(d, z.instanceof(Uint8Array));
          }
          break;
        }
        case COSEKeyType.OKP: {
          const crv = map.get(COSEKeyTypeParam.OKP_crv);
          assertSchema(crv, COSEKeyCurveSchema); // Assuming same curve schema applies or define OKPCurveSchema

          const x = map.get(COSEKeyTypeParam.OKP_x);
          assertSchema(x, z.instanceof(Uint8Array));

          if (map.has(COSEKeyTypeParam.OKP_d)) {
            const d = map.get(COSEKeyTypeParam.OKP_d);
            assertSchema(d, z.instanceof(Uint8Array));
          }
          break;
        }
        case COSEKeyType.RSA: {
          const n = map.get(COSEKeyTypeParam.RSA_n);
          assertSchema(n, z.instanceof(Uint8Array));

          const e = map.get(COSEKeyTypeParam.RSA_e);
          assertSchema(e, z.instanceof(Uint8Array));
          break;
        }
        case COSEKeyType.Oct: {
          const k = map.get(COSEKeyTypeParam.Symmetric_k);
          assertSchema(k, z.instanceof(Uint8Array));
          break;
        }
        // Add other cases (HSS_LMS, WalnutDSA, AKP) as needed based on your validation strictness
        default:
          throw new UnsupportedKeyType();
      }

      return true;
    } catch {
      return false;
    }
  }
}
