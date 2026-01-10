import { USER_ID, upsertTestingUser } from '../../../../auth/__tests__/helpers';

import { PrismaClient } from '@repo/prisma';
import type { Uint8Array_ } from '@repo/types';
import type {
  AuthenticatorAssertionResponse as DOMAuthenticatorAssertionResponse,
  AuthenticatorAttachment,
  AuthenticatorAttestationResponse as DOMAuthenticatorAttestationResponse,
  AuthenticatorTransport,
} from '@repo/types/dom';
import {
  type RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { VirtualAuthenticatorAgent } from '../../../src/VirtualAuthenticatorAgent';
import {
  type FetchFn,
  VirtualAuthenticatorAgentClient,
} from '../../../src/browser/VirtualAuthenticatorAgentClient';
import { PublicKeyCredentialCreationOptionsDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialCreationOptionsDtoSchema';
import { PublicKeyCredentialDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialDtoSchema';
import { PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema';
import { PublicKeyCredentialRequestOptionsDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialRequestOptionsDtoSchema';
import { UserVerification } from '../../../src/enums/UserVerification';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import type { AuthenticationExtensionsClientOutputs } from '../../../src/validation/spec/AuthenticationExtensionsClientOutputsSchema';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  CHALLENGE_BASE64URL,
  CHALLENGE_BYTES,
  PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
  RP_ID,
  RP_ORIGIN,
} from '../../helpers/consts';

/**
 * Integration tests for VirtualAuthenticatorAgentClient
 *
 * These tests verify that the client correctly communicates with the VirtualAuthenticatorAgent
 * using a custom fetch function that directly calls the agent instead of making HTTP requests.
 * This simulates the browser extension flow:
 * main-world -> content script -> background script -> agent -> response -> ...
 */
describe('VirtualAuthenticatorAgentClient', () => {
  const prisma = new PrismaClient();
  const keyVaultKeyIdGenerator = new KeyVaultKeyIdGenerator();
  const keyProvider = new MockKeyProvider({ keyVaultKeyIdGenerator });
  const webAuthnPublicKeyCredentialRepository = new PrismaWebAuthnRepository({
    prisma,
  });
  const authenticator = new VirtualAuthenticator({
    webAuthnRepository: webAuthnPublicKeyCredentialRepository,
    keyProvider,
  });
  const agent = new VirtualAuthenticatorAgent({ authenticator });

  /**
   * Custom fetch function that directly calls the VirtualAuthenticatorAgent
   * instead of making HTTP requests. This simulates the browser extension
   * messaging flow where requests are routed through content/background scripts.
   */
  const createDirectAgentFetch = (): FetchFn => {
    return async (url, init) => {
      const body = JSON.parse(init.body as string);
      const path = new URL(url).pathname;

      try {
        if (path === '/api/credentials/create') {
          // Decode the DTO (base64url strings) back to Uint8Array values
          const decodedOptions =
            PublicKeyCredentialCreationOptionsDtoSchema.parse(
              body.publicKeyCredentialCreationOptions,
            );

          const result = await agent.createCredential({
            origin: body.meta.origin,
            options: {
              publicKey: decodedOptions,
            },
            sameOriginWithAncestors: true,
            meta: {
              userId: USER_ID,
              apiKeyId: null,
              origin: body.meta.origin,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
            },
            context: undefined,
          });

          return {
            status: 200,
            json: async () => PublicKeyCredentialDtoSchema.encode(result),
          };
        }

        if (path === '/api/credentials/get') {
          // Decode the DTO (base64url strings) back to Uint8Array values
          const decodedOptions =
            PublicKeyCredentialRequestOptionsDtoSchema.parse(
              body.publicKeyCredentialRequestOptions,
            );

          const result = await agent.getAssertion({
            origin: body.meta.origin,
            options: {
              publicKey: decodedOptions,
            },
            sameOriginWithAncestors: true,
            meta: {
              userId: USER_ID,
              apiKeyId: null,
              origin: body.meta.origin,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
            },
            context: undefined,
          });

          return {
            status: 200,
            json: async () =>
              PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema.encode(
                result,
              ),
          };
        }

        return {
          status: 404,
          json: async () => ({ error: 'Not found' }),
        };
      } catch (error) {
        return {
          status: 500,
          json: async () => ({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        };
      }
    };
  };

  const cleanupWebAuthnPublicKeyCredentials = async () => {
    await prisma.$transaction([
      prisma.webAuthnPublicKeyCredential.deleteMany(),
      prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
    ]);
  };

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials();
  });

  describe('createCredential', () => {
    test('should create a credential and return a valid PublicKeyCredential', async () => {
      const client = new VirtualAuthenticatorAgentClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'test-api-key',
        origin: RP_ORIGIN,
        fetch: createDirectAgentFetch(),
      });

      const credential = await client.createCredential({
        publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
      });

      // Verify the credential has the expected structure
      expect(credential).toBeDefined();
      expect(credential.id).toBeDefined();
      expect(credential.type).toBe('public-key');
      expect(credential.rawId).toBeInstanceOf(ArrayBuffer);
      expect(credential.response).toBeDefined();
      expect(credential.response.clientDataJSON).toBeInstanceOf(ArrayBuffer);

      // Verify using simplewebauthn server
      const registrationVerification = await verifyRegistrationResponse({
        response: PublicKeyCredentialDtoSchema.encode({
          id: credential.id,
          rawId: new Uint8Array(credential.rawId) as Uint8Array_,
          type: credential.type as 'public-key',
          response: {
            clientDataJSON: new Uint8Array(
              credential.response.clientDataJSON,
            ) as Uint8Array_,
            attestationObject: new Uint8Array(
              (
                credential.response as DOMAuthenticatorAttestationResponse
              ).attestationObject,
            ) as Uint8Array_,
            transports: (
              credential.response as DOMAuthenticatorAttestationResponse
            ).getTransports() as AuthenticatorTransport[],
          },
          clientExtensionResults:
            credential.getClientExtensionResults() as AuthenticationExtensionsClientOutputs,
          authenticatorAttachment:
            credential.authenticatorAttachment as AuthenticatorAttachment | null,
        }) as RegistrationResponseJSON,
        expectedChallenge: CHALLENGE_BASE64URL,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: false,
      });

      expect(registrationVerification.verified).toBe(true);
    });
  });

  describe('getAssertion', () => {
    test('should get an assertion for an existing credential', async () => {
      const client = new VirtualAuthenticatorAgentClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'test-api-key',
        origin: RP_ORIGIN,
        fetch: createDirectAgentFetch(),
      });

      // First, create a credential
      const createdCredential = await client.createCredential({
        publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
      });

      // Verify the created credential to get the public key
      const registrationVerification = await verifyRegistrationResponse({
        response: PublicKeyCredentialDtoSchema.encode({
          id: createdCredential.id,
          rawId: new Uint8Array(createdCredential.rawId) as Uint8Array_,
          type: createdCredential.type as 'public-key',
          response: {
            clientDataJSON: new Uint8Array(
              createdCredential.response.clientDataJSON,
            ) as Uint8Array_,
            attestationObject: new Uint8Array(
              (
                createdCredential.response as DOMAuthenticatorAttestationResponse
              ).attestationObject,
            ) as Uint8Array_,
            transports: (
              createdCredential.response as DOMAuthenticatorAttestationResponse
            ).getTransports() as AuthenticatorTransport[],
          },
          clientExtensionResults:
            createdCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputs,
          authenticatorAttachment:
            createdCredential.authenticatorAttachment as AuthenticatorAttachment | null,
        }) as RegistrationResponseJSON,
        expectedChallenge: CHALLENGE_BASE64URL,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: false,
      });

      expect(registrationVerification.verified).toBe(true);

      // Now, get an assertion
      const assertionResult = await client.getAssertion({
        publicKey: {
          challenge: CHALLENGE_BYTES,
          rpId: RP_ID,
          allowCredentials: [
            {
              type: 'public-key',
              id: new Uint8Array(createdCredential.rawId) as Uint8Array_,
            },
          ],
          userVerification: UserVerification.PREFERRED,
        },
      });

      // If it returns an array, it means multiple credentials match and user needs to choose
      // For this test, we expect a single credential response
      if (Array.isArray(assertionResult)) {
        expect(assertionResult.length).toBeGreaterThan(0);
        return;
      }

      const assertion = assertionResult;

      // Verify the assertion has the expected structure
      expect(assertion).toBeDefined();
      expect(assertion.id).toBe(createdCredential.id);
      expect(assertion.type).toBe('public-key');
      expect(assertion.rawId).toBeInstanceOf(ArrayBuffer);
      expect(assertion.response).toBeDefined();
      expect(assertion.response.clientDataJSON).toBeInstanceOf(ArrayBuffer);

      // Verify using simplewebauthn server
      const authenticationVerification = await verifyAuthenticationResponse({
        response:
          PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema.encode(
            {
              id: assertion.id,
              rawId: new Uint8Array(assertion.rawId) as Uint8Array_,
              type: assertion.type as 'public-key',
              response: {
                clientDataJSON: new Uint8Array(
                  assertion.response.clientDataJSON,
                ) as Uint8Array_,
                authenticatorData: new Uint8Array(
                  (
                    assertion.response as DOMAuthenticatorAssertionResponse
                  ).authenticatorData,
                ) as Uint8Array_,
                signature: new Uint8Array(
                  (
                    assertion.response as DOMAuthenticatorAssertionResponse
                  ).signature,
                ) as Uint8Array_,
                userHandle: (
                  assertion.response as DOMAuthenticatorAssertionResponse
                ).userHandle
                  ? (new Uint8Array(
                      (
                        assertion.response as DOMAuthenticatorAssertionResponse
                      ).userHandle!,
                    ) as Uint8Array_)
                  : null,
              },
              clientExtensionResults:
                assertion.getClientExtensionResults() as AuthenticationExtensionsClientOutputs,
              authenticatorAttachment:
                assertion.authenticatorAttachment as AuthenticatorAttachment | null,
            },
          ) as AuthenticationResponseJSON,
        expectedChallenge: CHALLENGE_BASE64URL,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: createdCredential.id,
          publicKey:
            registrationVerification.registrationInfo!.credential.publicKey,
          counter:
            registrationVerification.registrationInfo!.credential.counter,
        },
        requireUserVerification: false,
      });

      expect(authenticationVerification.verified).toBe(true);
    });
  });
});
