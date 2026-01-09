import { assertSchema } from '@repo/assert';
import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';
import { webcrypto } from 'node:crypto';
import z from 'zod';

import type { COSEPublicKeyOKP } from './COSEPublicKey';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { JWKKeyCurveName } from './enums/JWKKeyCurveName';
import { importKey } from './importKey';
import { COSEKeyAlgorithmSchema } from './validation/enums/COSEKeyAlgorithmSchema';
import { COSEKeyCurveNameSchema } from './validation/enums/COSEKeyCurveNameSchema';

/**
 * Verify a signature using an OKP (Octet Key Pair) public key.
 *
 * @param opts - The verification options.
 * @param opts.cosePublicKey - The COSE OKP public key to use for verification.
 * @param opts.signature - The signature to verify.
 * @param opts.data - The data that was signed.
 * @returns A promise that resolves to true if the signature is valid, false otherwise.
 *
 * @see https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/helpers/iso/isoCrypto/verifyOKP.ts
 */
export async function verifyOKP(opts: {
  cosePublicKey: COSEPublicKeyOKP;
  signature: Uint8Array_;
  data: Uint8Array_;
}): Promise<boolean> {
  const { cosePublicKey, signature, data } = opts;

  const alg = cosePublicKey.get(COSEKeyParam.alg);
  const crv = cosePublicKey.get(COSEKeyTypeParam.crv);
  const x = cosePublicKey.get(COSEKeyTypeParam.x);

  assertSchema(
    alg,
    COSEKeyAlgorithmSchema.describe('Public key was missing alg (OKP)'),
  );

  assertSchema(
    crv,
    COSEKeyCurveNameSchema.describe('Public key was missing crv (OKP)'),
  );

  assertSchema(
    x,
    z.instanceof(Uint8Array).describe('Public key was missing x (OKP)'),
  );

  assertSchema(
    crv,
    z
      .literal(COSEKeyCurveName.Ed25519)
      .describe(`Unexpected COSE crv value of ${crv} (OKP)`),
  );

  const _crv: JWKKeyCurveName = JWKKeyCurveName.Ed25519;

  const keyData: webcrypto.JsonWebKey = {
    kty: 'OKP',
    crv: _crv,
    alg: 'EdDSA',
    x: Buffer.from(x).toString('base64url'),
    ext: false,
  };

  const keyAlgorithm: webcrypto.EcKeyImportParams = {
    name: _crv,
    namedCurve: _crv,
  };

  const key = await importKey({
    keyData,
    algorithm: keyAlgorithm,
  });

  const verifyAlgorithm: webcrypto.AlgorithmIdentifier = {
    name: _crv,
  };

  return webcrypto.subtle.verify(verifyAlgorithm, key, signature, data);
}
