import { assertSchema } from '@repo/assert';
import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';
import { webcrypto } from 'node:crypto';
import z from 'zod';

import type { COSEPublicKeyEC } from './COSEPublicKey';
import { KeyAlgorithmMapper } from './KeyAlgorithmMapper';
import type { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { JWKKeyCurveName } from './enums/JWKKeyCurveName';
import { importKey } from './importKey';
import { COSEKeyAlgorithmSchema } from './validation/enums/COSEKeyAlgorithmSchema';
import { COSEKeyCurveNameSchema } from './validation/enums/COSEKeyCurveNameSchema';

/**
 * Verify a signature using an EC2 public key.
 *
 * @param opts - The verification options.
 * @param opts.cosePublicKey - The COSE EC2 public key to use for verification.
 * @param opts.signature - The signature to verify.
 * @param opts.data - The data that was signed.
 * @param opts.shaHashOverride - Optional override for the SHA hash algorithm.
 * @returns A promise that resolves to true if the signature is valid, false otherwise.
 *
 * @see https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/helpers/iso/isoCrypto/verifyEC2.ts
 */
export async function verifyEC(opts: {
  cosePublicKey: COSEPublicKeyEC;
  signature: Uint8Array_;
  data: Uint8Array_;
  shaHashOverride?: COSEKeyAlgorithm;
}): Promise<boolean> {
  const { cosePublicKey, signature, data, shaHashOverride } = opts;

  const alg = cosePublicKey.get(COSEKeyParam.alg);
  const crv = cosePublicKey.get(COSEKeyTypeParam.crv);
  const x = cosePublicKey.get(COSEKeyTypeParam.x);
  const y = cosePublicKey.get(COSEKeyTypeParam.y);

  assertSchema(
    alg,
    COSEKeyAlgorithmSchema.describe('Public key was missing alg (EC2)'),
  );

  assertSchema(
    crv,
    COSEKeyCurveNameSchema.describe('Public key was missing crv (EC2)'),
  );

  assertSchema(
    x,
    z.instanceof(Uint8Array).describe('Public key was missing x (EC2)'),
  );

  assertSchema(
    y,
    z.instanceof(Uint8Array).describe('Public key was missing y (EC2)'),
  );

  assertSchema(
    crv,
    z
      .union([
        z.literal(COSEKeyCurveName['P-256']),
        z.literal(COSEKeyCurveName['P-384']),
        z.literal(COSEKeyCurveName['P-521']),
      ])
      .describe(`Unexpected COSE crv value of ${crv} (EC2)`),
  );

  const _crv: JWKKeyCurveName =
    crv === COSEKeyCurveName['P-256']
      ? JWKKeyCurveName['P-256']
      : crv === COSEKeyCurveName['P-384']
        ? JWKKeyCurveName['P-384']
        : JWKKeyCurveName['P-521'];

  const keyData: webcrypto.JsonWebKey = {
    kty: 'EC',
    crv: _crv,
    x: Buffer.from(x).toString('base64url'),
    y: Buffer.from(y).toString('base64url'),
    ext: false,
  };

  const keyAlgorithm: webcrypto.EcKeyImportParams = {
    /**
     * Note to future self: you can't use `COSEKeyAlgorithmToSubtleCryptoKeyAlgName()` here because some
     * leaf certs from actual devices specified an RSA SHA value for `alg` (e.g. `-257`) which
     * would then map here to `'RSASSA-PKCS1-v1_5'`. We always want `'ECDSA'` here so we'll
     * hard-code this.
     */
    name: 'ECDSA',
    namedCurve: _crv,
  };

  const key = await importKey({
    keyData,
    algorithm: keyAlgorithm,
  });

  // Determine which SHA algorithm to use for signature verification
  let subtleAlg = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(alg);
  if (shaHashOverride) {
    subtleAlg =
      KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(shaHashOverride);
  }

  const verifyAlgorithm: webcrypto.EcdsaParams = {
    name: 'ECDSA',
    hash: { name: subtleAlg },
  };

  return webcrypto.subtle.verify(verifyAlgorithm, key, signature, data);
}
