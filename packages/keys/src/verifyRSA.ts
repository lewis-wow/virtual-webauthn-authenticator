import { assertSchema } from '@repo/assert';
import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';
import { webcrypto } from 'node:crypto';
import z from 'zod';

import type { COSEPublicKeyRSA } from './COSEPublicKey';
import { KeyAlgorithmMapper } from './KeyAlgorithmMapper';
import type { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { JWKKeyAlgorithm } from './enums/JWKKeyAlgorithm';
import { SubtleCryptoAlg } from './enums/SubtleCryptoAlg';
import { SubtleCryptoKeyAlgName } from './enums/SubtleCryptoKeyAlgName';
import { importKey } from './importKey';
import { COSEKeyAlgorithmSchema } from './validation/enums/COSEKeyAlgorithmSchema';

/**
 * Verify a signature using an RSA public key.
 *
 * @param opts - The verification options.
 * @param opts.cosePublicKey - The COSE RSA public key to use for verification.
 * @param opts.signature - The signature to verify.
 * @param opts.data - The data that was signed.
 * @param opts.shaHashOverride - Optional override for the SHA hash algorithm.
 * @returns A promise that resolves to true if the signature is valid, false otherwise.
 *
 * @see https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/helpers/iso/isoCrypto/verifyRSA.ts
 */
export async function verifyRSA(opts: {
  cosePublicKey: COSEPublicKeyRSA;
  signature: Uint8Array_;
  data: Uint8Array_;
  shaHashOverride?: COSEKeyAlgorithm;
}): Promise<boolean> {
  const { cosePublicKey, signature, data, shaHashOverride } = opts;

  const alg = cosePublicKey.get(COSEKeyParam.alg);
  const n = cosePublicKey.get(COSEKeyTypeParam.n);
  const e = cosePublicKey.get(COSEKeyTypeParam.e);

  assertSchema(
    alg,
    COSEKeyAlgorithmSchema.describe('Public key was missing alg (RSA)'),
  );

  assertSchema(
    n,
    z.instanceof(Uint8Array).describe('Public key was missing n (RSA)'),
  );

  assertSchema(
    e,
    z.instanceof(Uint8Array).describe('Public key was missing e (RSA)'),
  );

  const keyAlgName =
    KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoKeyAlgName(alg);

  assertSchema(
    keyAlgName,
    z
      .union([
        z.literal(SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5']),
        z.literal(SubtleCryptoKeyAlgName['RSA-PSS']),
      ])
      .describe(`Unexpected RSA key algorithm ${alg} (${keyAlgName})`),
  );

  // Determine hash algorithm
  let hashAlg = KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(alg);
  if (shaHashOverride) {
    hashAlg =
      KeyAlgorithmMapper.COSEKeyAlgorithmToSubtleCryptoAlg(shaHashOverride);
  }

  // Determine JWK algorithm string based on key algorithm and hash
  let jwkAlg: JWKKeyAlgorithm;
  if (keyAlgName === SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5']) {
    if (hashAlg === SubtleCryptoAlg['SHA-256']) {
      jwkAlg = JWKKeyAlgorithm.RS256;
    } else if (hashAlg === SubtleCryptoAlg['SHA-384']) {
      jwkAlg = JWKKeyAlgorithm.RS384;
    } else {
      jwkAlg = JWKKeyAlgorithm.RS512;
    }
  } else {
    // RSA-PSS
    if (hashAlg === SubtleCryptoAlg['SHA-256']) {
      jwkAlg = JWKKeyAlgorithm.PS256;
    } else if (hashAlg === SubtleCryptoAlg['SHA-384']) {
      jwkAlg = JWKKeyAlgorithm.PS384;
    } else {
      jwkAlg = JWKKeyAlgorithm.PS512;
    }
  }

  const keyData: webcrypto.JsonWebKey = {
    kty: 'RSA',
    alg: jwkAlg,
    n: Buffer.from(n).toString('base64url'),
    e: Buffer.from(e).toString('base64url'),
    ext: false,
  };

  const keyAlgorithm: webcrypto.RsaHashedImportParams = {
    name: keyAlgName,
    hash: { name: hashAlg },
  };

  const key = await importKey({
    keyData,
    algorithm: keyAlgorithm,
  });

  // Build verify algorithm params
  let verifyAlgorithm: webcrypto.AlgorithmIdentifier | webcrypto.RsaPssParams =
    {
      name: keyAlgName,
    };

  // Add salt length for RSA-PSS
  if (keyAlgName === SubtleCryptoKeyAlgName['RSA-PSS']) {
    /**
     * Salt length. The default value is 20 but the convention is to use hLen,
     * the length of the output of the hash function in bytes.
     * A salt length of zero is permitted and will result in a deterministic signature value.
     *
     * @see https://www.cryptosys.net/pki/manpki/pki_rsaschemes.html
     */
    let saltLength = 0;

    if (hashAlg === SubtleCryptoAlg['SHA-256']) {
      saltLength = 32; // 256 bits => 32 bytes
    } else if (hashAlg === SubtleCryptoAlg['SHA-384']) {
      saltLength = 48; // 384 bits => 48 bytes
    } else if (hashAlg === SubtleCryptoAlg['SHA-512']) {
      saltLength = 64; // 512 bits => 64 bytes
    }

    verifyAlgorithm = {
      name: keyAlgName,
      saltLength,
    };
  }

  return webcrypto.subtle.verify(verifyAlgorithm, key, signature, data);
}
