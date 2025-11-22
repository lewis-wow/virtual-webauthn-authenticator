import { JsonWebKey } from '../../src/JsonWebKey';
import { KeyCurveName, KeyType } from '../../src/enums';

export const JsonWebPublicKey = new JsonWebKey({
  kty: KeyType.EC,
  crv: KeyCurveName.P256,
  x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
  y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
});
