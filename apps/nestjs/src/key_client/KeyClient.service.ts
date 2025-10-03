import { Injectable } from '@nestjs/common';
import { KeyClient, KeyVaultKey } from '@azure/keyvault-keys';
import { CoseAlgorithmIdentifier } from '@repo/enums';
import { CoseAlgorithmIdentifierMapper } from '../lib/mappers/CoseAlgorithmIdentifierMapper.js';
import { bufferFromBufferSource } from '@repo/utils/bufferFromBufferSource';
import { randomUUID } from 'node:crypto';

@Injectable()
export class KeyClientService {
  constructor(private readonly keyClient: KeyClient) {}

  private composeKeyName({
    rp,
    user,
    credentialId,
  }: Pick<PublicKeyCredentialCreationOptions, 'rp' | 'user'> & {
    credentialId?: string;
  }): {
    keyName: string;
    credentialId: string;
  } {
    const base64urlRp = Buffer.from(rp.id ?? rp.name).toString('base64url');
    const base64urlUser = bufferFromBufferSource(user.id).toString('base64url');
    const _credentialId = credentialId ?? randomUUID();

    return {
      keyName: `${base64urlRp}-${base64urlUser}-${_credentialId}`,
      credentialId: _credentialId,
    };
  }

  private pickPubKeyCredParams({
    pubKeyCredParams,
  }: Pick<
    PublicKeyCredentialCreationOptions,
    'pubKeyCredParams'
  >): PublicKeyCredentialParameters {
    if (!pubKeyCredParams[0]) {
      throw new Error('PublicKey credential parameters is empty array.');
    }

    return pubKeyCredParams[0];
  }

  async createKey({
    rp,
    user,
    pubKeyCredParams: pubKeyCredParamsOpts,
  }: Pick<
    PublicKeyCredentialCreationOptions,
    'rp' | 'user' | 'pubKeyCredParams'
  >): Promise<{ keyVaultKey: KeyVaultKey; credentialId: string }> {
    const { keyName, credentialId } = this.composeKeyName({ rp, user });
    const pubKeyCredParams = this.pickPubKeyCredParams({
      pubKeyCredParams: pubKeyCredParamsOpts,
    });

    const algorithm = pubKeyCredParams.alg as CoseAlgorithmIdentifier;

    const keyVaultKey = await this.keyClient.createKey(
      keyName,
      CoseAlgorithmIdentifierMapper.toKnownJsonWebKeyType(algorithm),
      {
        curve:
          CoseAlgorithmIdentifierMapper.toKnownJsonWebKeyCurveName(algorithm),
      },
    );

    return { keyVaultKey, credentialId };
  }

  async getKey({
    rp,
    user,
    credentialId,
  }: Pick<PublicKeyCredentialCreationOptions, 'rp' | 'user'> & {
    credentialId: string;
  }): Promise<{ keyVaultKey: KeyVaultKey; credentialId: string }> {
    const { keyName } = this.composeKeyName({ rp, user, credentialId });

    const keyVaultKey = await this.keyClient.getKey(keyName);

    return { keyVaultKey, credentialId };
  }
}
