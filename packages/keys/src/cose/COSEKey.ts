import { assertSchema } from '@repo/assert';
import * as cbor from 'cbor2';
import z from 'zod';

import type { IKey } from '../shared/IKey';
import { UnsupportedKeyType } from '../shared/exceptions/UnsupportedKeyType';
import type { ICOSEKeyMap } from './cbor/ICOSEKeyMap';
import { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { CannotParseCOSEKey } from './exceptions/CannotParseCOSEKey';

export class COSEKey implements IKey {
  readonly map: ICOSEKeyMap;

  constructor(map: ICOSEKeyMap) {
    if (!COSEKey.canParse(map)) {
      throw new CannotParseCOSEKey();
    }

    this.map = map;
  }

  toBytes(): Uint8Array {
    return cbor.encode(this.map);
  }

  static fromBytes(bytes: Uint8Array): COSEKey {
    const decoded = cbor.decode<ICOSEKeyMap>(bytes);
    return new COSEKey(decoded);
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

  // --- EC2 (Elliptic Curve) Specific Properties ---

  /** Returns EC2 Curve (crv) */
  public getEcCrv(): number | undefined {
    return this.map.get(COSEKeyTypeParam.EC_crv) as number | undefined;
  }

  /** Returns EC2 X Coordinate (x) */
  public getEcX(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.EC_x) as Uint8Array | undefined;
  }

  /** Returns EC2 Y Coordinate (y) */
  public getEcY(): Uint8Array | boolean | undefined {
    // Note: y can be a boolean (sign bit) for compressed points
    return this.map.get(COSEKeyTypeParam.EC_y) as
      | Uint8Array
      | boolean
      | undefined;
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

  // --- Dilithium (AKP) Specific Properties ---

  /** Returns Dilithium Public Key (pub) */
  public getDilithiumPub(): Uint8Array | undefined {
    return this.map.get(COSEKeyTypeParam.Dilithium_pub) as
      | Uint8Array
      | undefined;
  }

  public static canParse(map: ICOSEKeyMap): boolean {
    try {
      const kty = map.get(COSEKeyParam.kty);
      assertSchema(kty, z.enum(COSEKeyType));

      const alg = map.get(COSEKeyParam.alg);
      assertSchema(alg, z.enum(COSEKeyAlgorithm));

      switch (kty) {
        case COSEKeyType.OKP: {
          const crv = map.get(COSEKeyTypeParam.OKP_crv);
          assertSchema(crv, z.enum(COSEKeyCurveName));

          const x = map.get(COSEKeyTypeParam.OKP_x);
          assertSchema(x, z.instanceof(Uint8Array));
          break;
        }
        case COSEKeyType.EC: {
          const crv = map.get(COSEKeyTypeParam.EC_crv);
          assertSchema(crv, z.enum(COSEKeyCurveName));

          const x = map.get(COSEKeyTypeParam.EC_x);
          assertSchema(x, z.instanceof(Uint8Array));

          const y = map.get(COSEKeyTypeParam.EC_y);
          // Y can be bytes or boolean (compressed)
          assertSchema(y, z.union([z.instanceof(Uint8Array), z.boolean()]));
          break;
        }
        case COSEKeyType.RSA: {
          const n = map.get(COSEKeyTypeParam.RSA_n);
          assertSchema(n, z.instanceof(Uint8Array));

          const e = map.get(COSEKeyTypeParam.RSA_e);
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
