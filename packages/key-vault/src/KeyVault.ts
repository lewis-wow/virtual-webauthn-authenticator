import { KeyClient, type KeyVaultKey } from '@azure/keyvault-keys';
import { COSEAlgorithm, PublicKeyCredentialType } from '@repo/enums';
import {
  COSEAlgorithmToAsymetricSigningAlgorithmMapper,
  COSEAlgorithmToEcCurveMapper,
} from '@repo/mappers';
import type {
  InterceptedAzureJsonWebKey,
  IPublicKeyCredentialCreationOptions,
  IPublicKeyCredentialParameters,
} from '@repo/types';
import {
  isEcAlgorithm,
  isRsaAlgorithm,
  interceptJsonWebKey,
} from '@repo/utils';
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
  result: KeyVaultKey;
  key: InterceptedAzureJsonWebKey;
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

  async createEcKey(
    opts: PickDeep<
      IPublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { rp, user, pubKeyCredParams } = opts;

    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });
    assert(
      COSEAlgorithmToAsymetricSigningAlgorithmMapper(pubKeyCredParam.alg),
      isEcAlgorithm,
    );

    const { keyName, credentialId } = this.createKeyName({ rp, user });

    const result = await this.keyClient.createEcKey(keyName, {
      curve: COSEAlgorithmToEcCurveMapper(pubKeyCredParam.alg),
    });

    return {
      result,
      key: interceptJsonWebKey(result.key!),
      credentialId,
    };
  }

  async createRsaKey(
    opts: PickDeep<
      IPublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { rp, user, pubKeyCredParams } = opts;

    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });
    assert(
      COSEAlgorithmToAsymetricSigningAlgorithmMapper(pubKeyCredParam.alg),
      isRsaAlgorithm,
    );

    const { keyName, credentialId } = this.createKeyName({ rp, user });

    const result = await this.keyClient.createRsaKey(keyName);

    return {
      result,
      key: interceptJsonWebKey(result.key!),
      credentialId,
    };
  }

  async createKey(
    opts: PickDeep<
      IPublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { pubKeyCredParams } = opts;
    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });

    if (
      isEcAlgorithm(
        COSEAlgorithmToAsymetricSigningAlgorithmMapper(pubKeyCredParam.alg),
      )
    ) {
      return await this.createEcKey(opts);
    }

    return await this.createRsaKey(opts);
  }

  async getKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<KeyPayload> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    const result = await this.keyClient.getKey(keyName);

    return {
      result,
      key: interceptJsonWebKey(result.key!),
      credentialId,
    };
  }

  async deleteKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<KeyPayload> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    const poller = await this.keyClient.beginDeleteKey(keyName);
    const result = await poller.pollUntilDone();

    return {
      result,
      key: interceptJsonWebKey(result.key!),
      credentialId,
    };
  }

  async purgeDeletedKey(
    opts: PickDeep<IPublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<void> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    await this.keyClient.purgeDeletedKey(keyName);
  }
}
