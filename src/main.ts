import { DefaultAzureCredential } from '@azure/identity';
import { KeyClient, KeyClientOptions } from '@azure/keyvault-keys';

const credential = new DefaultAzureCredential();
const url = 'https://localhost:3443';
const options: KeyClientOptions = {
  serviceVersion: '7.4',
  // DEV ONLY
  disableChallengeResourceVerification: true,
};

const client = new KeyClient(url, credential, options);
const keyVaultKey = await client.createRsaKey('rsa-key', {
  keySize: 2048,
  keyOps: ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
});

console.log('keyVaultKey', keyVaultKey);
