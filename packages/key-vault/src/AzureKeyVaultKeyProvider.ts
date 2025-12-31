import type { KeyClient, KeyVaultKey, SignResult } from '@azure/keyvault-keys';
import { JsonWebKey } from '@repo/keys';
import { KeyAlgorithm, KeyOperation } from '@repo/keys/enums';
import { COSEKeyAlgorithmMapper, COSEKeyMapper } from '@repo/keys/mappers';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/virtual-authenticator/enums';
import type {
  IKeyProvider,
  WebAuthnPublicKeyCredentialWithMeta,
} from '@repo/virtual-authenticator/types';
import type { PubKeyCredParamStrict } from '@repo/virtual-authenticator/zod-validation';
import ecdsa from 'ecdsa-sig-formatter';

import type { CryptographyClientFactory } from './CryptographyClientFactory';
import { UnexpectedWebAuthnCredentialKeyMetaType } from './exceptions/UnexpectedWebAuthnCredentialKeyMetaType';

export type KeyPayload = {
  jwk: JsonWebKey;
  meta: {
    keyVaultKey: KeyVaultKey;
  };
};

export type SignPayload = {
  signature: Uint8Array;
  meta: {
    signResult: SignResult;
  };
};

export type AzureKeyVaultKeyProviderOptions = {
  keyClient: KeyClient;
  cryptographyClientFactory: CryptographyClientFactory;
};

export class AzureKeyVaultKeyProvider implements IKeyProvider {
  private readonly keyClient: KeyClient;
  private readonly cryptographyClientFactory: CryptographyClientFactory;

  constructor(opts: AzureKeyVaultKeyProviderOptions) {
    this.keyClient = opts.keyClient;
    this.cryptographyClientFactory = opts.cryptographyClientFactory;
  }

  private async _createKey(opts: {
    keyName: string;
    supportedPubKeyCredParam: PubKeyCredParamStrict;
  }): Promise<KeyPayload> {
    const { keyName, supportedPubKeyCredParam } = opts;

    const keyVaultKey = await this.keyClient
      .createKey(
        keyName,
        COSEKeyAlgorithmMapper.COSEKeyAlgorithmToKeyType(
          supportedPubKeyCredParam.alg,
        ),
        {
          keyOps: [KeyOperation.SIGN],
          curve: COSEKeyAlgorithmMapper.COSEKeyAlgorithmToKeyCurveName(
            supportedPubKeyCredParam.alg,
          ),
        },
      )
      .catch((error) => {
        throw error;
      });

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  private async _getKey(opts: { keyName: string }): Promise<KeyPayload> {
    const { keyName } = opts;
    const keyVaultKey = await this.keyClient.getKey(keyName);

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  private async _sign(opts: {
    keyVaultKey: KeyVaultKey;
    algorithm: KeyAlgorithm;
    data: Uint8Array;
  }): Promise<SignPayload> {
    const { keyVaultKey, algorithm, data } = opts;

    const cryptographyClient =
      this.cryptographyClientFactory.createCryptographyClient({ keyVaultKey });

    const signResult = await cryptographyClient.signData(algorithm, data);

    return {
      signature: ecdsa.joseToDer(Buffer.from(signResult.result), algorithm),
      meta: {
        signResult,
      },
    };
  }

  async generateKeyPair(opts: {
    webAuthnCredentialId: string;
    pubKeyCredParams: PubKeyCredParamStrict;
  }) {
    const { webAuthnCredentialId, pubKeyCredParams } = opts;

    const {
      jwk,
      meta: { keyVaultKey },
    } = await this._createKey({
      keyName: webAuthnCredentialId,
      supportedPubKeyCredParam: pubKeyCredParams,
    });

    const COSEPublicKey = COSEKeyMapper.jwkToCOSEKey(jwk);

    return {
      COSEPublicKey: COSEKeyMapper.COSEKeyToBytes(COSEPublicKey),
      webAuthnPublicKeyCredentialKeyMetaType:
        WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
        keyVaultKeyId: keyVaultKey.id ?? null,
        keyVaultKeyName: keyVaultKey.name,
        hsm: false,
      },
    };
  }

  async sign(opts: {
    data: Uint8Array;
    webAuthnCredential: WebAuthnPublicKeyCredentialWithMeta;
  }) {
    const { data, webAuthnCredential } = opts;

    if (
      webAuthnCredential.webAuthnPublicKeyCredentialKeyMetaType !==
      WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT
    ) {
      throw new UnexpectedWebAuthnCredentialKeyMetaType();
    }

    const {
      meta: { keyVaultKey },
    } = await this._getKey({
      keyName:
        webAuthnCredential.webAuthnPublicKeyCredentialKeyVaultKeyMeta
          .keyVaultKeyName,
    });

    const keyAlgorithm = KeyAlgorithm.ES256;

    const signature = await this._sign({
      algorithm: keyAlgorithm,
      keyVaultKey,
      data,
    });

    return {
      signature: signature.signature,
      alg: COSEKeyAlgorithmMapper.keyAlgorithmToCOSEKeyAlgorithm(keyAlgorithm),
    };
  }
}
