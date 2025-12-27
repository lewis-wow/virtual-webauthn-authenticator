import { JsonWebKey } from '@repo/keys';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { COSEKeyMapper } from '@repo/keys/mappers';
import {
  createSign,
  generateKeyPairSync,
  KeyPairKeyObjectResult,
} from 'node:crypto';

import { WebAuthnCredentialKeyMetaType } from '../../src/enums/WebAuthnCredentialKeyMetaType';
import { IKeyProvider } from '../../src/types/IKeyProvider';
import { WebAuthnPublicKeyCredentialWithMeta } from '../../src/types/WebAuthnPublicKeyCredentialWithMeta';
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

  async generateKeyPair(opts: { webAuthnCredentialId: string }) {
    const { webAuthnCredentialId } = opts;

    const keyPair = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });

    this.keyPairStore[webAuthnCredentialId] = keyPair;

    const credentialPublicKey = new JsonWebKey(
      keyPair.publicKey.export({ format: 'jwk' }),
    );

    const COSEPublicKey = COSEKeyMapper.COSEKeyToBytes(
      COSEKeyMapper.jwkToCOSEKey(credentialPublicKey),
    );

    const { keyVaultKeyId, keyVaultKeyName } =
      this.keyVaultKeyIdGenerator.next();

    return {
      COSEPublicKey,
      webAuthnPublicKeyCredentialKeyMetaType:
        WebAuthnCredentialKeyMetaType.KEY_VAULT,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
        keyVaultKeyId,
        keyVaultKeyName,
        hsm: false,
      },
    };
  }

  async sign(opts: {
    data: Uint8Array;
    webAuthnCredential: WebAuthnPublicKeyCredentialWithMeta;
  }) {
    const { data, webAuthnCredential } = opts;

    const keyPair = this.keyPairStore[webAuthnCredential.id]!;

    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return { signature, alg: COSEKeyAlgorithm.ES256 };
  }

  getKeyPairStore(): Record<string, KeyPairKeyObjectResult> {
    return this.keyPairStore;
  }
}
