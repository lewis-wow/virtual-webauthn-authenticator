import { KeyClient, type KeyVaultKey } from '@azure/keyvault-keys';
import { COSEAlgorithm, PublicKeyCredentialType } from '@repo/enums';
import {
  COSEAlgorithmToAsymetricSigningAlgorithmMapper,
  COSEAlgorithmToEcCurveMapper,
} from '@repo/mappers';
import type {
  IPublicKeyCredentialCreationOptions,
  IPublicKeyCredentialParameters,
} from '@repo/types';
import { randomUUID } from 'node:crypto';
import {
  applyCascade,
  assert,
  hasMinLength,
  isArray,
  isEnum,
  isInstanceOf,
  isObject,
  isOptional,
  isString,
} from 'typanion';
import type { PickDeep } from 'type-fest';

export type KeyVaultOptions = {
  keyClient: KeyClient;
};

export type CreateKeyNamePayload = {
  keyName: string;
  credentialId: string;
};

export type KeyPayload = {
  keyVaultKey: KeyVaultKey;
  credentialId: string;
};

export class KeyVault {
  private readonly keyClient: KeyClient;

  constructor(opts: KeyVaultOptions) {
    this.keyClient = opts.keyClient;
  }

  private createKeyName(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId?: string;
    },
  ): CreateKeyNamePayload {
    const { rp, user, credentialId: credentialIdOption } = opts;

    assert(rp.id, isString());
    assert(user.id, isInstanceOf(Buffer));
    assert(credentialIdOption, isOptional(isString()));

    const base64urlRp = Buffer.from(rp.id).toString('base64url');
    const base64urlUser = user.id.toString('base64url');
    const credentialId = credentialIdOption ?? randomUUID();

    return {
      keyName: `${base64urlRp}-${base64urlUser}-${credentialId}`,
      credentialId,
    };
  }

  private pickPubKeyCredParam(
    opts: Pick<IPublicKeyCredentialCreationOptions, 'pubKeyCredParams'>,
  ): IPublicKeyCredentialParameters {
    const { pubKeyCredParams } = opts;

    assert(
      pubKeyCredParams,
      applyCascade(
        isArray(
          isObject({
            alg: isEnum(COSEAlgorithm),
            type: isEnum(PublicKeyCredentialType),
          }),
        ),
        hasMinLength(1),
      ),
    );

    return pubKeyCredParams[0]!;
  }

  async createKey(
    opts: PickDeep<
      IPublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { rp, user, pubKeyCredParams } = opts;

    const { keyName, credentialId } = this.createKeyName({ rp, user });
    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });

    const keyVaultKey = await this.keyClient
      .createEcKey(keyName, {
        curve: COSEAlgorithmToEcCurveMapper(pubKeyCredParam.alg),
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return { keyVaultKey, credentialId };
  }

  async getKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<{ keyVaultKey: KeyVaultKey; credentialId: string }> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    const keyVaultKey = await this.keyClient.getKey(keyName);

    return { keyVaultKey, credentialId };
  }
}
