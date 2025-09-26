import { DefaultAzureCredential } from '@azure/identity';
import { KeyClient, KeyClientOptions } from '@azure/keyvault-keys';
import { env } from './env.js';

const credential = new DefaultAzureCredential();
const options: KeyClientOptions = {
  serviceVersion: '7.4',
  // DEV ONLY
  disableChallengeResourceVerification: true,
};

const client = new KeyClient(env.AZURE_KEY_VAULT_HOST, credential, options);
const keyVaultKey = await client.createRsaKey('rsa-key', {
  keySize: 2048,
  keyOps: ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
});

console.log('keyVaultKey', keyVaultKey);
