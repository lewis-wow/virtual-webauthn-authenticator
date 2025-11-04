import { COSEKey } from '@repo/keys';
import {
  CHALLENGE_BASE64URL,
  CHALLENGE_RAW,
  KEY_VAULT_KEY_ID,
  KEY_VAULT_KEY_NAME,
  RP_ID,
  RP_NAME,
  upsertTestingUser,
  USER_DISPLAY_NAME,
  USER_ID,
  USER_ID_RAW,
  USER_NAME,
} from '@repo/test-helpers';
import { bufferToUuid } from '@repo/utils';
import {
  PublicKeyCredentialRequestOptions,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialSchema,
} from '@repo/validation';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../src/VirtualAuthenticator';
import { credentialSigner } from '../helpers/credentialSigner';
import { COSEPublicKey, keyPair } from '../helpers/key';
import { prisma } from '../helpers/prisma';

const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
  rp: {
    name: RP_NAME,
    id: RP_ID,
  },
  user: {
    id: USER_ID_RAW,
    name: USER_NAME,
    displayName: USER_DISPLAY_NAME,
  },
  challenge: CHALLENGE_RAW,
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  timeout: 60000,
  attestation: 'none',
};

const createPublicKeyCredentialRequestOptions = (
  credentialID: Buffer,
): PublicKeyCredentialRequestOptions => ({
  challenge: CHALLENGE_RAW,
  rpId: RP_ID,
  allowCredentials: [
    {
      id: credentialID,
      type: 'public-key',
    },
  ],
  userVerification: 'required',
});

describe('VirtualAuthenticator', () => {
  let authenticator: VirtualAuthenticator;
  let registrationVerification: VerifiedRegistrationResponse;

  beforeAll(async () => {
    authenticator = new VirtualAuthenticator({ prisma });

    await upsertTestingUser({ prisma });

    const webAuthnCredentialKeyVaultKeyMeta =
      await prisma.webAuthnCredentialKeyVaultKeyMeta.create({
        data: {
          keyVaultKeyName: KEY_VAULT_KEY_NAME,
          keyVaultKeyId: KEY_VAULT_KEY_ID,
        },
      });

    const publicKeyCredential = await authenticator.createCredential({
      publicKeyCredentialCreationOptions,
      COSEPublicKey,
      meta: {
        webAuthnCredentialKeyVaultKeyMeta,
      },
    });

    registrationVerification = await verifyRegistrationResponse({
      response: PublicKeyCredentialSchema.encode(
        publicKeyCredential,
      ) as RegistrationResponseJSON,
      expectedChallenge: CHALLENGE_BASE64URL,
      expectedOrigin: publicKeyCredentialCreationOptions.rp.id!,
      expectedRPID: publicKeyCredentialCreationOptions.rp.id,
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });
  });

  afterAll(async () => {
    await prisma.webAuthnCredential.deleteMany();
    await prisma.webAuthnCredentialKeyVaultKeyMeta.deleteMany();
    await prisma.user.deleteMany();
  });

  /**
   * These tests verify the output of the `beforeAll` block.
   * They confirm that the registration was successful and correct.
   */
  describe('Registration (createCredential)', () => {
    test('should be verified successfully', () => {
      expect(registrationVerification.verified).toBe(true);
    });

    test('should initialize the signature counter to 0', () => {
      expect(
        registrationVerification.registrationInfo?.credential.counter,
      ).toBe(0);
    });

    test('should contain the correct public key', () => {
      const jwk = COSEKey.fromBuffer(
        registrationVerification.registrationInfo!.credential.publicKey,
      ).toJwk();
      expect(jwk).toMatchObject(keyPair.publicKey.export({ format: 'jwk' }));
    });

    test('credential ID should be in the database', async () => {
      const credentialID = bufferToUuid(
        Buffer.from(
          registrationVerification.registrationInfo!.credential.id,
          'base64url',
        ),
      );

      const webAuthnCredential = await prisma.webAuthnCredential.findUnique({
        where: {
          id: credentialID,
        },
      });

      expect(webAuthnCredential).to.not.toBeNull();
      console.log('webAuthnCredential', webAuthnCredential);
    });
  });

  /**
   * This block tests the authentication flow.
   * It *uses* the verified registration from the `beforeAll` setup
   * to request and verify a new assertion.
   */
  describe('Authentication (getCredential)', () => {
    test('should produce a verifiable assertion', async () => {
      const {
        id: credentialID,
        publicKey: credentialPublicKey,
        counter: credentialCounter,
      } = registrationVerification.registrationInfo!.credential;

      const publicKeyCredentialRequestOptions =
        createPublicKeyCredentialRequestOptions(
          Buffer.from(credentialID, 'base64url'),
        );

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        credentialSignerFactory: () => credentialSigner,
        meta: {
          user: {
            id: USER_ID,
          },
        },
      });

      const authenticationVerification = await verifyAuthenticationResponse({
        response: PublicKeyCredentialSchema.encode(
          publicKeyCredential,
        ) as AuthenticationResponseJSON,
        expectedChallenge: CHALLENGE_BASE64URL,
        expectedOrigin: RP_ID,
        expectedRPID: RP_ID,
        credential: {
          id: credentialID,
          publicKey: credentialPublicKey,
          counter: credentialCounter, // The original counter (0)
        },
        requireUserVerification: true,
      });

      // The most important check: confirm that the authentication was successful.
      expect(authenticationVerification.verified).toBe(true);

      // A critical security check: ensure the signature counter has incremented.
      // The server must store this new value.
      expect(authenticationVerification.authenticationInfo.newCounter).toBe(1);
    });

    test('should fail with different RP ID', async () => {
      const { id: credentialID } =
        registrationVerification.registrationInfo!.credential;

      const publicKeyCredentialRequestOptions =
        createPublicKeyCredentialRequestOptions(
          Buffer.from(credentialID, 'base64url'),
        );

      await expect(() =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions: {
            ...publicKeyCredentialRequestOptions,
            rpId: 'WRONG_RP_ID',
          },
          credentialSignerFactory: () => credentialSigner,
          meta: {
            user: {
              id: USER_ID,
            },
          },
        }),
      ).to.rejects.toThrowError();
    });

    test('should fail with user ID', async () => {
      const { id: credentialID } =
        registrationVerification.registrationInfo!.credential;

      const publicKeyCredentialRequestOptions =
        createPublicKeyCredentialRequestOptions(
          Buffer.from(credentialID, 'base64url'),
        );

      await expect(() =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions,
          credentialSignerFactory: () => credentialSigner,
          meta: {
            user: {
              id: 'WRONG_USER_ID',
            },
          },
        }),
      ).to.rejects.toThrowError();
    });
  });
});
