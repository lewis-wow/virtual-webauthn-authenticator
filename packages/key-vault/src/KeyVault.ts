import {
  KeyClient,
  type KeyVaultKey,
  type SignResult,
  type VerifyResult,
} from '@azure/keyvault-keys';
import {
  COSEKeyAlgorithm,
  PublicKeyCredentialType,
  type KeyAlgorithm,
} from '@repo/enums';
import { JsonWebKey } from '@repo/keys';
import {
  COSEAlgorithmToKeyCurveNameMapper,
  COSEKeyAlgorithmToKeyAlgorithmMapper,
} from '@repo/mappers';
import type { User, WebAuthnCredential } from '@repo/prisma';
import { isEcAlgorithm, isRsaAlgorithm } from '@repo/utils';
import type { PublicKeyCredentialCreationOptions } from '@repo/validation';
import {
  assert,
  isLiteral,
  isString,
  isArray,
  isPartial,
  cascade,
  isEnum,
  hasMinLength,
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
      this.cryptographyClientFactory.createCryptographyClient(keyVaultKey);

    const signResult = await cryptographyClient.signData(algorithm, data);

    return {
      signature: signResult.result,
      meta: {
        signResult,
      },
    };
  }

  async verifySignature(opts: {
    keyVaultKey: KeyVaultKey;
    algorithm: KeyAlgorithm;
    data: Buffer;
    signature: Uint8Array;
  }): Promise<VerifySignaturePayload> {
    const { keyVaultKey, algorithm, data, signature } = opts;

    const cryptographyClient =
      this.cryptographyClientFactory.createCryptographyClient(keyVaultKey);

    const verifyResult = await cryptographyClient.verifyData(
      algorithm,
      data,
      signature,
    );

    return {
      isValid: verifyResult.result,
      meta: {
        verifyResult,
      },
    };
  }

  private _createKeyName(
    opts: PickDeep<PublicKeyCredentialCreationOptions, 'rp.id'>,
    user: Pick<User, 'id'>,
  ): string {
    const { rp } = opts;

    assert(rp.id, isString());

    const base64urlRp = Buffer.from(rp.id).toString('base64url');
    const base64urlUser = Buffer.from(user.id).toString('base64url');

    return `${base64urlRp}-${base64urlUser}`;
  }

  async createEcKey(
    opts: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
    user: Pick<User, 'id'>,
  ): Promise<KeyPayload> {
    const { rp, pubKeyCredParams } = opts;

    assert(user.id, isLiteral(opts.user.id));

    const pubKeyCredParam = this._pickPubKeyCredParams({
      pubKeyCredParams,
    });

    assert(
      COSEKeyAlgorithmToKeyAlgorithmMapper(pubKeyCredParam.alg),
      isEcAlgorithm,
    );

    const keyName = this._createKeyName({ rp }, user);

    const keyVaultKey = await this.keyClient.createEcKey(keyName, {
      curve: COSEAlgorithmToKeyCurveNameMapper(pubKeyCredParam.alg),
    });

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  async createRsaKey(
    opts: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
    user: Pick<User, 'id'>,
  ): Promise<KeyPayload> {
    const { rp, pubKeyCredParams } = opts;

    assert(user.id, isLiteral(opts.user.id));

    const pubKeyCredParam = this._pickPubKeyCredParams({
      pubKeyCredParams,
    });

    assert(
      COSEKeyAlgorithmToKeyAlgorithmMapper(pubKeyCredParam.alg),
      isRsaAlgorithm,
    );

    const keyName = this._createKeyName({ rp }, user);

    const keyVaultKey = await this.keyClient.createRsaKey(keyName);

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  async createKey(
    opts: PickDeep<
      PublicKeyCredentialCreationOptions,
      'rp.id' | 'user.id' | 'pubKeyCredParams'
    >,
    user: Pick<User, 'id'>,
  ): Promise<KeyPayload> {
    const { pubKeyCredParams } = opts;

    assert(user.id, isLiteral(opts.user.id));

    const pubKeyCredParam = this._pickPubKeyCredParams({
      pubKeyCredParams,
    });

    if (
      isEcAlgorithm(COSEKeyAlgorithmToKeyAlgorithmMapper(pubKeyCredParam.alg))
    ) {
      return await this.createEcKey(opts, user);
    }

    return await this.createRsaKey(opts, user);
  }

  async getKey(
    webAuthnCredential: Pick<WebAuthnCredential, 'keyVaultKeyName'>,
  ): Promise<KeyPayload> {
    const keyVaultKey = await this.keyClient.getKey(
      webAuthnCredential.keyVaultKeyName,
    );

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  async deleteKey(
    opts: {
      rpId: string;
    },
    user: Pick<User, 'id'>,
  ): Promise<KeyPayload> {
    const { rpId } = opts;

    assert(rpId, isString());

    const keyName = this._createKeyName(
      {
        rp: { id: rpId },
      },
      user,
    );

    const poller = await this.keyClient.beginDeleteKey(keyName);
    const keyVaultKey = await poller.pollUntilDone();

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  async purgeDeletedKey(
    opts: {
      rpId: string;
    },
    user: Pick<User, 'id'>,
  ): Promise<void> {
    const { rpId } = opts;

    assert(rpId, isString());

    const keyName = this._createKeyName(
      {
        rp: { id: rpId },
      },
      user,
    );

    await this.keyClient.purgeDeletedKey(keyName);
  }
}
