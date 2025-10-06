import { describe, it, expect } from 'vitest';
import { jwkToCose } from './jwkToCose.js';
import { encode, decode } from 'cbor-x';
import type { Jwk } from './types.js';
import { coseToJwk } from './coseToJwk.js';

describe('jwkToCose', () => {
  describe('with EC keys', () => {
    it('should correctly round-trip a public P-256 EC key', () => {
      const originalJwk: Jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
        y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
      };

      const coseKey = jwkToCose(originalJwk);
      expect(coseKey).toBeDefined();
      expect(decode(encode(coseKey))).toStrictEqual(coseKey);

      const coseBuffer = encode(coseKey);
      const roundTrippedJwk = coseToJwk(decode(coseBuffer));

      expect(roundTrippedJwk).toMatchObject(originalJwk);
    });

    // it('should correctly round-trip a private P-256 EC key', () => {
    //   const originalJwk: JsonWebKey = {
    //     kty: 'EC',
    //     crv: 'P-256',
    //     x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
    //     y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
    //     d: 'RGs-NTMbC3S8EYM-LI_2a2yN2AnTpF2YAbK2DPa1fS4',
    //   };

    //   const coseKey = jwkToCose(originalJwk);
    //   const roundTrippedJwk = coseToJwk(encode(coseKey!));

    //   expect(roundTrippedJwk).toEqual(originalJwk);
    // });

    //   it('should correctly round-trip a public Ed25519 key', () => {
    //     const originalJwk: JsonWebKey = {
    //       kty: 'OKP', // `cose-to-jwk` uses OKP for EdDSA, so we match it
    //       crv: 'Ed25519',
    //       x: 'zdpL23z340A-vWQVZkAn9jS5WIxfeotI5b4L4x4j4VA',
    //     };
    //     // Our function infers 'EdDSA' alg and maps OKP kty from EC/Ed25519 crv
    //     const coseKey = jwkToCose({
    //       kty: 'EC',
    //       crv: 'Ed25519',
    //       x: originalJwk.x,
    //       y: '',
    //     }); // y is required by our function signature but not used for OKP
    //     const roundTrippedJwk = coseToJwk(cborEncode(coseKey!));

    //     // `cose-to-jwk` correctly outputs kty: 'OKP' for Ed25519
    //     expect(roundTrippedJwk).toEqual(originalJwk);
    //   });
    // });

    // describe('with RSA keys', () => {
    //   it('should correctly round-trip a public RSA key', () => {
    //     const originalJwk: JsonWebKey = {
    //       kty: 'RSA',
    //       n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w',
    //       e: 'AQAB',
    //     };

    //     const coseKey = jwkToCose(originalJwk);
    //     expect(coseKey).toBeDefined();

    //     const roundTrippedJwk = coseToJwk(cborEncode(coseKey!));
    //     expect(roundTrippedJwk).toEqual(originalJwk);
    //   });
    // });

    // describe('with Symmetric (oct) keys', () => {
    //   it('should correctly round-trip a 256-bit symmetric key', () => {
    //     const originalJwk: JsonWebKey = {
    //       kty: 'oct',
    //       k: 'Vlaj4r4n-22t3s5xGfpPlQh5z2ZAbG-ci554zYy_GzI',
    //     };

    //     const coseKey = jwkToCose(originalJwk);
    //     expect(coseKey).toBeDefined();

    //     const roundTrippedJwk = coseToJwk(cborEncode(coseKey!));
    //     expect(roundTrippedJwk).toEqual(originalJwk);
    //   });
    // });

    // describe('with unsupported keys', () => {
    //   it('should return undefined for a key with an unsupported algorithm', () => {
    //     // Our function does not have a COSE mapping for RS512
    //     const jwk: JsonWebKey = { kty: 'RSA', alg: 'RS512', n: 'n', e: 'e' };
    //     expect(jwkToCose(jwk)).toBeUndefined();
    //   });

    //   it('should return undefined for an EC key with a missing crv', () => {
    //     const jwk: JsonWebKey = { kty: 'EC', x: 'x', y: 'y' };
    //     expect(jwkToCose(jwk)).toBeUndefined();
    //   });

    //   it('should return undefined for an RSA key with missing params', () => {
    //     const jwk: JsonWebKey = { kty: 'RSA', e: 'AQAB' };
    //     expect(jwkToCose(jwk)).toBeUndefined();
    //   });
  });
});
