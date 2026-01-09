import { COSEKeyAlgorithm } from '@repo/keys/cose/enums';
import { JsonWebKey } from '@repo/keys/jwk';
import { KeyMapper } from '@repo/keys/shared/mappers';
import {
  createSign,
  generateKeyPairSync,
  type KeyPairKeyObjectResult,
} from 'node:crypto';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../../src/enums/WebAuthnPublicKeyCredentialKeyMetaType';
import type { IKeyProvider } from '../../src/types/IKeyProvider';
import type { WebAuthnPublicKeyCredentialWithMeta } from '../../src/types/WebAuthnPublicKeyCredentialWithMeta';
import { KeyVaultKeyIdGenerator } from './KeyVaultKeyIdGenerator';

export type MockKeyProviderOptions = {
  keyVaultKeyIdGenerator: KeyVaultKeyIdGenerator;
};

export class MockKeyProvider implements IKeyProvider {
  private readonly keyVaultKeyIdGenerator: KeyVaultKeyIdGenerator;

  private keyPairStore: Record<string, KeyPairKeyObjectResult> = {};

  constructor(opts: MockKeyProviderOptions) {
    this.keyVaultKeyIdGenerator = opts.keyVaultKeyIdGenerator;
  }

  async generateKeyPair(opts: { webAuthnPublicKeyCredentialId: string }) {
    const { webAuthnPublicKeyCredentialId } = opts;

    const keyPair = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });

    this.keyPairStore[webAuthnPublicKeyCredentialId] = keyPair;

    const credentialPublicKey = new JsonWebKey(
      keyPair.publicKey.export({ format: 'jwk' }),
    );

    const coseKey = KeyMapper.JWKToCOSE(credentialPublicKey);
    const COSEPublicKey = coseKey.toBytes();

    const { keyVaultKeyId, keyVaultKeyName } =
      this.keyVaultKeyIdGenerator.next();

    return {
      COSEPublicKey,
      webAuthnPublicKeyCredentialKeyMetaType:
        WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
        keyVaultKeyId,
        keyVaultKeyName,
        hsm: false,
      },
    };
  }

  async sign(opts: {
    data: Uint8Array;
    webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
  }) {
    const { data, webAuthnPublicKeyCredential } = opts;

    const keyPair = this.keyPairStore[webAuthnPublicKeyCredential.id]!;

    const signature = new Uint8Array(
      createSign('sha256')
        .update(data)
        .sign({ key: keyPair.privateKey, dsaEncoding: 'ieee-p1363' }),
    );

    return { signature, alg: COSEKeyAlgorithm.ES256 };
  }

  getKeyPairStore(): Record<string, KeyPairKeyObjectResult> {
    return this.keyPairStore;
  }
}
