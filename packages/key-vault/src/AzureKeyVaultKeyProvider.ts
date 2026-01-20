import {
  KnownKeyOperations,
  type KeyClient,
  type KeyVaultKey,
  type SignResult,
  type JsonWebKey as AzureJsonWebKey,
} from '@azure/keyvault-keys';
import { assertSchema } from '@repo/assert';
import * as cbor from '@repo/cbor';
import { KeyMapper } from '@repo/keys';
import { KeyAlgorithmMapper } from '@repo/keys';
import { decodeCOSEPublicKey } from '@repo/keys/cbor';
import {
  COSEKeyAlgorithm,
  COSEKeyParam,
  JWKKeyAlgorithm,
} from '@repo/keys/enums';
import { COSEKeyAlgorithmSchema } from '@repo/keys/validation';
import type { Uint8Array_ } from '@repo/types';
import type { JsonWebKey } from '@repo/types/dom';
import { toB64 } from '@repo/utils';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/virtual-authenticator/enums';
import type {
  IKeyProvider,
  WebAuthnPublicKeyCredentialWithMeta,
} from '@repo/virtual-authenticator/types';
import type { PubKeyCredParamStrict } from '@repo/virtual-authenticator/validation';
import ecdsa from 'ecdsa-sig-formatter';

import type { CryptographyClientFactory } from './CryptographyClientFactory';
import { OKPKeyTypeNotSupported } from './exceptions/OKPKeyTypeNotSupported';
import { UnexpectedWebAuthnPublicKeyCredentialKeyMetaType } from './exceptions/UnexpectedWebAuthnPublicKeyCredentialKeyMetaType';
import { UnsupportedKeyType } from './exceptions/UnsupportedKeyType';

export type KeyPayload = {
  jwk: JsonWebKey;
  meta: {
    keyVaultKey: KeyVaultKey;
  };
};

export type SignPayload = {
  signature: Uint8Array_;
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

  private _azureKeyVaultKeyToJsonWebKey(
    azureJsonWebKey: AzureJsonWebKey,
  ): JsonWebKey {
    return {
      kty: azureJsonWebKey.kty,
      crv: azureJsonWebKey.crv,
      x: toB64(azureJsonWebKey.x as Uint8Array_ | undefined),
      y: toB64(azureJsonWebKey.y as Uint8Array_ | undefined),
      e: toB64(azureJsonWebKey.e as Uint8Array_ | undefined),
      n: toB64(azureJsonWebKey.n as Uint8Array_ | undefined),
      d: toB64(azureJsonWebKey.d as Uint8Array_ | undefined),
      dp: toB64(azureJsonWebKey.dp as Uint8Array_ | undefined),
      dq: toB64(azureJsonWebKey.dq as Uint8Array_ | undefined),
      p: toB64(azureJsonWebKey.p as Uint8Array_ | undefined),
      q: toB64(azureJsonWebKey.q as Uint8Array_ | undefined),
      qi: toB64(azureJsonWebKey.qi as Uint8Array_ | undefined),
      k: toB64(azureJsonWebKey.k as Uint8Array_ | undefined),
      key_ops: azureJsonWebKey.keyOps,
    };
  }

  /**
   * Creates a new cryptographic key in Azure Key Vault.
   * Supports EC (P-256, P-384, P-521) and RSA keys.
   *
   * @param opts.keyName - The name for the new key
   * @param opts.supportedPubKeyCredParam - Public key credential parameters
   * @param opts.hsm - If true, key will be created in HSM (Hardware Security Module)
   * @returns KeyPayload containing the JWK and Key Vault metadata
   */
  private async _createKey(opts: {
    keyName: string;
    supportedPubKeyCredParam: PubKeyCredParamStrict;
    hsm: boolean;
  }): Promise<KeyPayload> {
    const { keyName, supportedPubKeyCredParam, hsm } = opts;

    const keyType = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyType(
      supportedPubKeyCredParam.alg,
    );
    const curve = KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyCurveName(
      supportedPubKeyCredParam.alg,
    );
    const keySize = KeyAlgorithmMapper.COSEKeyAlgorithmToRSAKeySize(
      supportedPubKeyCredParam.alg,
    );

    let keyVaultKey: KeyVaultKey;

    switch (keyType) {
      case 'EC':
        // Create EC key (P-256, P-384, P-521)
        keyVaultKey = await this.keyClient.createEcKey(keyName, {
          keyOps: [KnownKeyOperations.Sign, KnownKeyOperations.Verify],
          curve: curve,
          hsm,
        });
        break;

      case 'RSA':
        // Create RSA key (RS256, RS384, RS512, PS256, PS384, PS512)
        keyVaultKey = await this.keyClient.createRsaKey(keyName, {
          keyOps: [KnownKeyOperations.Sign, KnownKeyOperations.Verify],
          keySize: keySize,
          hsm,
        });
        break;

      case 'OKP':
        // OKP keys (Ed25519/EdDSA) are NOT supported by Azure Key Vault
        throw new OKPKeyTypeNotSupported();

      default:
        throw new UnsupportedKeyType({
          message: `Unsupported key type: ${keyType}`,
        });
    }

    return {
      jwk: this._azureKeyVaultKeyToJsonWebKey(keyVaultKey.key!),
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
      jwk: this._azureKeyVaultKeyToJsonWebKey(keyVaultKey.key!),
      meta: {
        keyVaultKey,
      },
    };
  }

  /**
   * Signs data using a key from Azure Key Vault.
   * Handles different signature formats for EC, RSA, and OKP keys.
   *
   * @param opts.keyVaultKey - The Key Vault key to use for signing
   * @param opts.algorithm - The signing algorithm
   * @param opts.data - The data to sign
   * @returns SignPayload containing the signature and metadata
   */
  private async _sign(opts: {
    keyVaultKey: KeyVaultKey;
    algorithm: JWKKeyAlgorithm;
    data: Uint8Array_;
  }): Promise<SignPayload> {
    const { keyVaultKey, algorithm, data } = opts;

    const cryptographyClient =
      this.cryptographyClientFactory.createCryptographyClient({ keyVaultKey });

    const signResult = await cryptographyClient.signData(algorithm, data);

    // EC signatures (ES256, ES384, ES512) need to be converted from JWS format to DER format
    // RSA and EdDSA signatures are returned as-is
    const isECAlgorithm =
      algorithm === JWKKeyAlgorithm.ES256 ||
      algorithm === JWKKeyAlgorithm.ES384 ||
      algorithm === JWKKeyAlgorithm.ES512;

    /**
     * For COSEAlgorithmIdentifier -7 (ES256), and other ECDSA-based algorithms,
     * the sig value MUST be encoded as an ASN.1 DER Ecdsa-Sig-Value
     * @see https://www.w3.org/TR/webauthn-3/#sctn-signature-attestation-types
     *
     * It is RECOMMENDED that any new attestation formats defined not use ASN.1 encodings, but instead represent signatures as equivalent fixed-length byte arrays without internal structure, using the same representations as used by COSE signatures as defined in [RFC9053] and [RFC8230].
     * For COSEAlgorithmIdentifier -257 (RS256), sig MUST contain the signature generated using the RSASSA-PKCS1-v1_5 signature scheme defined in Section 8.2.1 of [RFC8017] with SHA-256 as the hash function. The signature is not ASN.1 wrapped.
     * For COSEAlgorithmIdentifier -37 (PS256), sig MUST contain the signature generated using the RSASSA-PSS signature scheme defined in Section 8.1.1 of [RFC8017] with SHA-256 as the hash function. The signature is not ASN.1 wrapped.
     */
    const signature = isECAlgorithm
      ? new Uint8Array(
          ecdsa.joseToDer(Buffer.from(signResult.result), algorithm),
        )
      : new Uint8Array(signResult.result);

    return {
      signature,
      meta: {
        signResult,
      },
    };
  }

  /**
   * Generates a new key pair for WebAuthn credentials.
   * @param opts.webAuthnPublicKeyCredentialId - The credential ID
   * @param opts.pubKeyCredParams - Public key credential parameters
   * @param opts.hsm - If true, key will be created in HSM (Hardware Security Module)
   * @returns Object containing COSE public key and Key Vault metadata
   */
  async generateKeyPair(opts: {
    webAuthnPublicKeyCredentialId: string;
    pubKeyCredParams: PubKeyCredParamStrict;
    hsm?: boolean;
  }): Promise<{
    COSEPublicKey: Uint8Array_;
    webAuthnPublicKeyCredentialKeyMetaType: WebAuthnPublicKeyCredentialKeyMetaType;
    webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
      keyVaultKeyId: string | null;
      keyVaultKeyName: string;
      hsm: boolean;
    };
  }> {
    const {
      webAuthnPublicKeyCredentialId,
      pubKeyCredParams,
      hsm = false,
    } = opts;

    const {
      jwk,
      meta: { keyVaultKey },
    } = await this._createKey({
      keyName: webAuthnPublicKeyCredentialId,
      supportedPubKeyCredParam: pubKeyCredParams,
      hsm,
    });

    const COSEPublicKey = KeyMapper.JWKPublicKeyToCOSEPublicKey(
      jwk,
      pubKeyCredParams.alg,
    );
    const COSEPublicKeyBytes = cbor.encode(COSEPublicKey);

    return {
      COSEPublicKey: COSEPublicKeyBytes,
      webAuthnPublicKeyCredentialKeyMetaType:
        WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
        keyVaultKeyId: keyVaultKey.id ?? null,
        keyVaultKeyName: keyVaultKey.name,
        hsm,
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
    data: Uint8Array_;
    webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
  }): Promise<{
    signature: Uint8Array_;
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

    const COSEPublicKey = decodeCOSEPublicKey(
      webAuthnPublicKeyCredential.COSEPublicKey,
    );

    const COSEPublicKeyAlgorithm = COSEPublicKey.get(COSEKeyParam.alg);
    assertSchema(COSEPublicKeyAlgorithm, COSEKeyAlgorithmSchema);

    const JWKKeyAlgorithm =
      KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        COSEPublicKeyAlgorithm,
      );

    const signature = await this._sign({
      algorithm: JWKKeyAlgorithm,
      keyVaultKey,
      data,
    });

    return {
      signature: signature.signature,
      alg: COSEPublicKeyAlgorithm,
    };
  }
}
