import { KeyClient, type KeyVaultKey } from '@azure/keyvault-keys';
import { COSEKeyAlgorithm, PublicKeyCredentialType } from '@repo/enums';
import { JsonWebKey } from '@repo/keys';
import {
  COSEAlgorithmToKeyCurveNameMapper,
  COSEKeyAlgorithmToKeyAlgorithmMapper,
} from '@repo/mappers';
import { isEcAlgorithm, isRsaAlgorithm } from '@repo/utils';
import type {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialParameters,
} from '@repo/validation';
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
  jwk: JsonWebKey;
  meta: {
    keyVaultKey: KeyVaultKey;
    credentialId: string;
  };
};

export class KeyVault {
  private readonly keyClient: KeyClient;

  constructor(opts: KeyVaultOptions) {
    this.keyClient = opts.keyClient;
  }

  private createKeyName(
    opts: PickDeep<PublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
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
    opts: Pick<PublicKeyCredentialCreationOptions, 'pubKeyCredParams'>,
  ): PublicKeyCredentialParameters {
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

  async createEcKey(
    opts: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { rp, user, pubKeyCredParams } = opts;

    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });
    assert(
      COSEKeyAlgorithmToKeyAlgorithmMapper(pubKeyCredParam.alg),
      isEcAlgorithm,
    );

    const { keyName, credentialId } = this.createKeyName({ rp, user });

    const keyVaultKey = await this.keyClient.createEcKey(keyName, {
      curve: COSEAlgorithmToKeyCurveNameMapper(pubKeyCredParam.alg),
    });

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
        credentialId,
      },
    };
  }

  async createRsaKey(
    opts: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { rp, user, pubKeyCredParams } = opts;

    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });
    assert(
      COSEKeyAlgorithmToKeyAlgorithmMapper(pubKeyCredParam.alg),
      isRsaAlgorithm,
    );

    const { keyName, credentialId } = this.createKeyName({ rp, user });

    const keyVaultKey = await this.keyClient.createRsaKey(keyName);

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
        credentialId,
      },
    };
  }

  async createKey(
    opts: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
  ): Promise<KeyPayload> {
    const { pubKeyCredParams } = opts;
    const pubKeyCredParam = this.pickPubKeyCredParam({ pubKeyCredParams });

    if (
      isEcAlgorithm(COSEKeyAlgorithmToKeyAlgorithmMapper(pubKeyCredParam.alg))
    ) {
      return await this.createEcKey(opts);
    }

    return await this.createRsaKey(opts);
  }

  async getKey(
    opts: PickDeep<PublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<KeyPayload> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    const keyVaultKey = await this.keyClient.getKey(keyName);

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
        credentialId,
      },
    };
  }

  async deleteKey(
    opts: PickDeep<PublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<KeyPayload> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    const poller = await this.keyClient.beginDeleteKey(keyName);
    const keyVaultKey = await poller.pollUntilDone();

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
        credentialId,
      },
    };
  }

  async purgeDeletedKey(
    opts: PickDeep<PublicKeyCredentialCreationOptions, 'rp.id' | 'user.id'> & {
      credentialId: string;
    },
  ): Promise<void> {
    const { rp, user, credentialId } = opts;

    const { keyName } = this.createKeyName({ rp, user, credentialId });

    await this.keyClient.purgeDeletedKey(keyName);
  }
}
