import { JsonWebKey } from '../../src/jwk/JsonWebKey';
import { JWKKeyCurveName } from '../../src/jwk/enums/JWKKeyCurveName';
import { JWKKeyType } from '../../src/jwk/enums/JWKKeyType';

export const JsonWebPublicKey = new JsonWebKey({
  kty: JWKKeyType.EC,
  crv: JWKKeyCurveName.P256,
  x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
  y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
});
