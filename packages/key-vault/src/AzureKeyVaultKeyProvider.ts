import {
  KnownKeyOperations,
  type KeyClient,
  type KeyVaultKey,
  type SignResult,
} from '@azure/keyvault-keys';
import type { COSEKeyAlgorithm } from '@repo/keys/cose/enums';
import { COSEKeyAlgorithmMapper } from '@repo/keys/cose/mappers';
import { JsonWebKey } from '@repo/keys/jwk';
import { JWKKeyAlgorithm } from '@repo/keys/jwk/enums';
import { KeyMapper } from '@repo/keys/shared/mappers';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/virtual-authenticator/enums';
import type {
  IKeyProvider,
  WebAuthnPublicKeyCredentialWithMeta,
} from '@repo/virtual-authenticator/types';
import type { PubKeyCredParamStrict } from '@repo/virtual-authenticator/zod-validation';
import ecdsa from 'ecdsa-sig-formatter';

import type { CryptographyClientFactory } from './CryptographyClientFactory';
import { UnexpectedWebAuthnPublicKeyCredentialKeyMetaType } from './exceptions/UnexpectedWebAuthnPublicKeyCredentialKeyMetaType';

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

  /**
   * Creates a new cryptographic key in Azure Key Vault.
   * @param opts.keyName - The name for the new key
   * @param opts.supportedPubKeyCredParam - Public key credential parameters
   * @returns KeyPayload containing the JWK and Key Vault metadata
   */
  private async _createKey(opts: {
    keyName: string;
    supportedPubKeyCredParam: PubKeyCredParamStrict;
  }): Promise<KeyPayload> {
    const { keyName, supportedPubKeyCredParam } = opts;

    const keyVaultKey = await this.keyClient.createKey(
      keyName,
      COSEKeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
        supportedPubKeyCredParam.alg,
      ),
      {
        keyOps: [KnownKeyOperations.Sign],
        curve: COSEKeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
          supportedPubKeyCredParam.alg,
        ),
      },
    );

    return {
      jwk: new JsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  /**
   * Retrieves an existing key from Azure Key Vault.
   * @param opts.keyName - The name of the key to retrieve
   * @returns KeyPayload containing the JWK and Key Vault metadata
   */
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

  /**
   * Signs data using a key from Azure Key Vault.
   * @param opts.keyVaultKey - The Key Vault key to use for signing
   * @param opts.algorithm - The signing algorithm
   * @param opts.data - The data to sign
   * @returns SignPayload containing the signature and metadata
   */
  private async _sign(opts: {
    keyVaultKey: KeyVaultKey;
    algorithm: JWKKeyAlgorithm;
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

  /**
   * Generates a new key pair for WebAuthn credentials.
   * @param opts.webAuthnPublicKeyCredentialId - The credential ID
   * @param opts.pubKeyCredParams - Public key credential parameters
   * @returns Object containing COSE public key and Key Vault metadata
   */
  async generateKeyPair(opts: {
    webAuthnPublicKeyCredentialId: string;
    pubKeyCredParams: PubKeyCredParamStrict;
  }): Promise<{
    COSEPublicKey: Uint8Array;
    webAuthnPublicKeyCredentialKeyMetaType: WebAuthnPublicKeyCredentialKeyMetaType;
    webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
      keyVaultKeyId: string | null;
      keyVaultKeyName: string;
      hsm: boolean;
    };
  }> {
    const { webAuthnPublicKeyCredentialId, pubKeyCredParams } = opts;

    const {
      jwk,
      meta: { keyVaultKey },
    } = await this._createKey({
      keyName: webAuthnPublicKeyCredentialId,
      supportedPubKeyCredParam: pubKeyCredParams,
    });

    const COSEPublicKey = KeyMapper.JWKToCOSE(jwk);

    return {
      COSEPublicKey: COSEPublicKey.toBytes(),
      webAuthnPublicKeyCredentialKeyMetaType:
        WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
        keyVaultKeyId: keyVaultKey.id ?? null,
        keyVaultKeyName: keyVaultKey.name,
        hsm: false,
      },
    };
  }

  /**
   * Signs data using the private key associated with a WebAuthn credential.
   * @param opts.data - The data to sign
   * @param opts.webAuthnPublicKeyCredential - The WebAuthn credential with metadata
   * @returns Object containing the signature and algorithm
   * @throws UnexpectedWebAuthnPublicKeyCredentialKeyMetaType if credential is not KEY_VAULT type
   */
  async sign(opts: {
    data: Uint8Array;
    webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
  }): Promise<{
    signature: Uint8Array;
    alg: COSEKeyAlgorithm;
  }> {
    const { data, webAuthnPublicKeyCredential } = opts;

    if (
      webAuthnPublicKeyCredential.webAuthnPublicKeyCredentialKeyMetaType !==
      WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT
    ) {
      throw new UnexpectedWebAuthnPublicKeyCredentialKeyMetaType();
    }

    const {
      meta: { keyVaultKey },
    } = await this._getKey({
      keyName:
        webAuthnPublicKeyCredential.webAuthnPublicKeyCredentialKeyVaultKeyMeta
          .keyVaultKeyName,
    });

    const keyAlgorithm = JWKKeyAlgorithm.ES256;

    const signature = await this._sign({
      algorithm: keyAlgorithm,
      keyVaultKey,
      data,
    });

    return {
      signature: signature.signature,
      alg: COSEKeyAlgorithmMapper.JWKKeyAlgorithmToCOSEKeyAlgorithm(
        keyAlgorithm,
      ),
    };
  }
}
