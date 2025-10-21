import { KeyClient, type KeyVaultKey } from '@azure/keyvault-keys';
import {
  COSEKeyAlgorithm,
  KeyCurveName,
  PublicKeyCredentialType,
} from '@repo/enums';
import { JsonWebKey } from '@repo/keys';
import {
  COSEAlgorithmToAsymetricSigningAlgorithmMapper,
  COSEAlgorithmToEcCurveMapper,
} from '@repo/mappers';
import type { PrismaClient } from '@repo/prisma';
import type {
  IPublicKeyCredentialCreationOptions,
  IPublicKeyCredentialParameters,
} from '@repo/types';
import { isEcAlgorithm, isRsaAlgorithm } from '@repo/utils';
import { randomUUID } from 'node:crypto';
import {
  applyCascade,
  assert,
  hasMinLength,
  isArray,
  isBoolean,
  isEnum,
  isInstanceOf,
  isLiteral,
  isObject,
  isOptional,
  isString,
  isUnknown,
} from 'typanion';
import type { PickDeep } from 'type-fest';

export type AzureKeyVaultOptions = {
  keyClient: KeyClient;
  prisma: PrismaClient;
};

export type AzureKeyVaultKeyPayload = {
  id: string;
  credentialId: string;
  name: string;
  result: KeyVaultKey;
  key: JsonWebKey;
};

export class AzureKeyVault {
  private readonly keyClient: KeyClient;
  private readonly prisma: PrismaClient;

  constructor(opts: AzureKeyVaultOptions) {
    this.keyClient = opts.keyClient;
    this.prisma = opts.prisma;
  }

  private _createAzureKeyName(): string {
    return randomUUID();
  }

  private _pickPubKeyCredParam(
    opts: Pick<IPublicKeyCredentialCreationOptions, 'pubKeyCredParams'>,
  ): IPublicKeyCredentialParameters {
    const { pubKeyCredParams } = opts;

    assert(
      pubKeyCredParams,
      applyCascade(
        isArray(
          isObject({
            alg: isEnum(COSEKeyAlgorithm),
            type: isEnum(PublicKeyCredentialType),
          }),
        ),
        hasMinLength(1),
      ),
    );

    return pubKeyCredParams[0]!;
  }

  async createEcKey(opts: {
    keyName: string;
    curve: KeyCurveName;
  }): Promise<KeyVaultKey> {
    const { curve, keyName } = opts;

    const result = await this.keyClient.createEcKey(keyName, {
      curve,
    });

    assert(result.id, isString());
    assert(result.key !== undefined, isLiteral(true));

    return result;
  }

  async createAzureRsaKey(
    opts: PickDeep<
      IPublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<AzureKeyPayload> {
    const { rp, user, pubKeyCredParams } = opts;

    const pubKeyCredParam = this._pickPubKeyCredParam({ pubKeyCredParams });
    assert(
      COSEAlgorithmToAsymetricSigningAlgorithmMapper(pubKeyCredParam.alg),
      isRsaAlgorithm,
    );

    const { keyName, credentialId } = this._createAzureKeyName({ rp, user });

    const result = await this.keyClient.createRsaKey(keyName);

    return {
      result,
      key: new JsonWebKey(result.key!),
      credentialId,
    };
  }

  async createAzureKey(
    opts: PickDeep<
      IPublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<AzureKeyPayload> {
    const { pubKeyCredParams } = opts;
    const pubKeyCredParam = this._pickPubKeyCredParam({ pubKeyCredParams });

    if (
      isEcAlgorithm(
        COSEAlgorithmToAsymetricSigningAlgorithmMapper(pubKeyCredParam.alg),
      )
    ) {
      return await this.createAzureEcKey(opts);
    }

    return await this.createAzureRsaKey(opts);
  }

  async getAzureKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<AzureKeyPayload> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this._createAzureKeyName({ rp, user, credentialId });

    const result = await this.keyClient.getKey(keyName);

    return {
      result,
      key: new JsonWebKey(result.key!),
      credentialId,
    };
  }

  async deleteKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<AzureKeyPayload> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this._createAzureKeyName({ rp, user, credentialId });

    const poller = await this.keyClient.beginDeleteKey(keyName);
    const result = await poller.pollUntilDone();

    return {
      result,
      key: new JsonWebKey(result.key!),
      credentialId,
    };
  }

  async purgeDeletedKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<void> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this._createAzureKeyName({ rp, user, credentialId });

    await this.keyClient.purgeDeletedKey(keyName);
  }
}
