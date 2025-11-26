import {
  KEY_VAULT_KEY_ID,
  KEY_VAULT_KEY_NAME,
} from '../../../key-vault/__tests__/helpers/consts';

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
import { WebAuthnCredentialWithMeta } from '../../src/types/WebAuthnCredentialWithMeta';

export class MockKeyProvider implements IKeyProvider {
  private keyPairStore: Record<string, KeyPairKeyObjectResult> = {};

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

    return {
      COSEPublicKey,
      webAuthnCredentialKeyMetaType: WebAuthnCredentialKeyMetaType.KEY_VAULT,
      webAuthnCredentialKeyVaultKeyMeta: {
        keyVaultKeyId: KEY_VAULT_KEY_ID,
        keyVaultKeyName: KEY_VAULT_KEY_NAME,
        hsm: false,
      },
    };
  }

  async sign(opts: {
    data: Uint8Array;
    webAuthnCredential: WebAuthnCredentialWithMeta;
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
