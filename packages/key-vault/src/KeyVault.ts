import {
  KeyClient,
  type KeyVaultKey,
  type SignResult,
  type VerifyResult,
} from '@azure/keyvault-keys';
import {
  COSEKeyAlgorithm,
  KeyOperation,
  PublicKeyCredentialType,
  type KeyAlgorithm,
} from '@repo/enums';
import { JsonWebKey } from '@repo/keys';
import { COSEKeyAlgorithmMapper } from '@repo/mappers';
import type { User } from '@repo/prisma';
import { bufferToUuid } from '@repo/utils';
import type { PublicKeyCredentialCreationOptions } from '@repo/validation';
import ecdsa from 'ecdsa-sig-formatter';
import {
  assert,
  isString,
  isArray,
  isPartial,
  cascade,
  isEnum,
  hasMinLength,
  isLiteral,
} from 'typanion';
import type { PickDeep } from 'type-fest';

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

  private _pickPubKeyCredParams(
    opts: Pick<PublicKeyCredentialCreationOptions, 'pubKeyCredParams'>,
  ) {
    const { pubKeyCredParams } = opts;

    assert(
      pubKeyCredParams,
      cascade(
        isArray(
          isPartial({
            type: isEnum(PublicKeyCredentialType),
            alg: isEnum(COSEKeyAlgorithm),
          }),
        ),
        hasMinLength(1),
      ),
    );

    return pubKeyCredParams[0]!;
  }

  async sign(opts: {
    keyVaultKey: KeyVaultKey;
    algorithm: KeyAlgorithm;
    data: Buffer;
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

  private _createKeyName(opts: {
    publicKeyCredentialCreationOptions: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id'
    >;
  }): string {
    const { publicKeyCredentialCreationOptions } = opts;

    assert(publicKeyCredentialCreationOptions.rp.id, isString());

    const base64urlRp = Buffer.from(
      publicKeyCredentialCreationOptions.rp.id,
    ).toString('base64url');

    const base64urlUser =
      publicKeyCredentialCreationOptions.user.id.toString('base64url');

    return `${base64urlRp}-${base64urlUser}`;
  }

  async createKey(opts: {
    publicKeyCredentialCreationOptions: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >;
    user: Pick<User, 'id'>;
  }): Promise<KeyPayload> {
    const { publicKeyCredentialCreationOptions, user } = opts;

    assert(
      bufferToUuid(publicKeyCredentialCreationOptions.user.id),
      isLiteral(user.id),
    );

    const pubKeyCredParam = this._pickPubKeyCredParams({
      pubKeyCredParams: publicKeyCredentialCreationOptions.pubKeyCredParams,
    });

    const keyName = this._createKeyName({
      publicKeyCredentialCreationOptions,
    });

    const keyVaultKey = await this.keyClient
      .createKey(
        keyName,
        COSEKeyAlgorithmMapper.toKeyType(pubKeyCredParam.alg),
        {
          keyOps: [KeyOperation.SIGN, KeyOperation.VERIFY],
          curve: COSEKeyAlgorithmMapper.toCurve(pubKeyCredParam.alg),
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

    const poller = await this.keyClient.beginDeleteKey(keyName);
    void poller.pollUntilDone();
  }

  async purgeDeletedKey(opts: { keyName: string }): Promise<void> {
    const { keyName } = opts;

    await this.keyClient.purgeDeletedKey(keyName);
  }
}
