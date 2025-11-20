import { JsonWebKey } from '@repo/keys';
import { COSEKeyMapper } from '@repo/keys/mappers';
import { generateKeyPairSync } from 'node:crypto';

export const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
});

export const credentialPublicKey = new JsonWebKey(
  keyPair.publicKey.export({ format: 'jwk' }),
);

export const COSEPublicKey = COSEKeyMapper.jwkToCOSEKey(credentialPublicKey);
