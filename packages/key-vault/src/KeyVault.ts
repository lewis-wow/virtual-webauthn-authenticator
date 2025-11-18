import {
  KeyClient,
  type KeyVaultKey,
  type SignResult,
  type VerifyResult,
} from '@azure/keyvault-keys';
import { JsonWebKey } from '@repo/keys';
import { KeyOperation, type KeyAlgorithm } from '@repo/keys/enums';
import { COSEKeyAlgorithmMapper } from '@repo/keys/mappers';
import type { PubKeyCredParamStrict } from '@repo/virtual-authenticator/validation';
import ecdsa from 'ecdsa-sig-formatter';

import type { CryptographyClientFactory } from './CryptographyClientFactory';

export type KeyVaultOptions = {
  keyClient: KeyClient;
  cryptographyClientFactory: CryptographyClientFactory;
};

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

export type VerifySignaturePayload = {
  isValid: boolean;
  meta: {
    verifyResult: VerifyResult;
  };
};

export class KeyVault {
  private readonly keyClient: KeyClient;
  private readonly cryptographyClientFactory: CryptographyClientFactory;

  constructor(opts: KeyVaultOptions) {
    this.keyClient = opts.keyClient;
    this.cryptographyClientFactory = opts.cryptographyClientFactory;
  }

  async sign(opts: {
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

  async createKey(opts: {
    keyName: string;
    supportedPubKeyCredParam: PubKeyCredParamStrict;
  }): Promise<KeyPayload> {
    const { keyName, supportedPubKeyCredParam } = opts;

    const keyVaultKey = await this.keyClient
      .createKey(
        keyName,
        COSEKeyAlgorithmMapper.toKeyType(supportedPubKeyCredParam.alg),
        {
          keyOps: [KeyOperation.SIGN],
          curve: COSEKeyAlgorithmMapper.toCurve(supportedPubKeyCredParam.alg),
        },
      )
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  async getKey(opts: { keyName: string }): Promise<KeyPayload> {
    const { keyName } = opts;
    const keyVaultKey = await this.keyClient.getKey(keyName);

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  async deleteKey(opts: { keyName: string }): Promise<void> {
    const { keyName } = opts;

    const poller = await this.keyClient
      .beginDeleteKey(keyName)
      .catch((error) => {
        console.error(error);
        throw error;
      });

    void poller.pollUntilDone();
  }

  async purgeDeletedKey(opts: { keyName: string }): Promise<void> {
    const { keyName } = opts;

    await this.keyClient.purgeDeletedKey(keyName);
  }
}
