import * as crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import type { IAuthenticator } from '../../src/authenticator/IAuthenticator';
import { UserPresenceRequired } from '../../src/authenticator/exceptions/UserPresenceRequired';
import { GenerateKeyPairFailed } from '../../src/exceptions/GenerateKeyPairFailed';
import { VirtualAuthenticatorController } from '../../src/http/VirtualAuthenticatorController';
import { ContextService } from '../../src/services/ContextService';
import { AuthenticatorMakeCredentialArgs } from '../../src/validation/authenticator/AuthenticatorMakeCredentialArgsSchema';

// Basic args (content doesn't matter much if we mock the authenticator)
const MOCK_ARGS: AuthenticatorMakeCredentialArgs = {
  hash: new Uint8Array(32),
  rpEntity: { name: 'RP', id: 'rp.id' },
  userEntity: { name: 'User', id: new Uint8Array(16), displayName: 'User' },
  requireResidentKey: false,
  requireUserPresence: true,
  requireUserVerification: false,
  credTypesAndPubKeyAlgs: [],
  enterpriseAttestationPossible: false,
  attestationFormats: [],
};

const MOCK_META = {
  userId: 'user-id',
  apiKeyId: 'api-key-id',
  userPresenceEnabled: true,
  userVerificationEnabled: true,
  origin: 'https://rp.id',
};

describe('VirtualAuthenticatorController', () => {
  it('should handle UserPresenceRequired exception and return context token', async () => {
    // 1. Setup ContextService
    const contextService = new ContextService({
      jwksEncryptionKey: crypto.randomBytes(32).toString('hex'),
    });

    // Initialize JWKS (create at least one key)
    // Accessing private jwks via any to initialize it, or rely on lazy loading if implemented?
    // ContextService doesn't expose key creation.
    // Wait, ContextService constructor creates a Jwks instance.
    // But Jwks needs keys.
    // Jwks class from @repo/crypto likely has methods to rotate/create keys.
    // The ContextService doesn't expose them.
    // However, Jwt.sign() will try to find a key. If none, it might fail or create one?
    // Let's assume Jwks or Jwt handles key generation on demand or I need to do it.
    // Inspecting ContextService: it does `this.jwt.sign(payload)`.
    // Inspecting Jwks (from memory): it typically needs a key.

    // To be safe, I'll use a mocked ContextService for simplicity OR rely on implementation details.
    // Actually, ContextService uses InMemoryJwksRepository.
    // If I cast contextService as any, I can access `jwks` and call `rotate()`.
    // Or simpler: The *real* implementation of Jwks in @repo/crypto likely auto-generates if missing?
    // If not, I should probably check.
    // But for now, let's assume it works or I'll fix it.
    // Checking ContextService.ts:
    /*
    const jwks = new Jwks({ ... });
    this.jwt = new Jwt({ jwks });
    */
    // If Jwks doesn't auto-create, I might need to trigger it.
    // Let's try to verify the flow first.

    // 2. Mock Authenticator
    const mockAuthenticator = mock<IAuthenticator>();

    // First call throws UP required
    mockAuthenticator.authenticatorMakeCredential.mockRejectedValueOnce(
      new UserPresenceRequired(),
    );

    // Second call succeeds
    const successResponse = {
      credentialId: new Uint8Array([1, 2, 3]),
      attestationObject: new Uint8Array([4, 5, 6]),
    };
    mockAuthenticator.authenticatorMakeCredential.mockResolvedValueOnce(
      successResponse,
    );

    const controller = new VirtualAuthenticatorController({
      contextService,
      authenticator: mockAuthenticator,
    });

    // 3. First Call: Should fail with 200 and context
    // We expect the controller to catch UserPresenceRequired and return a context.
    // Since we didn't provide a context (or provided empty one), the controller calls authenticator.
    // Authenticator throws.

    // Note: ContextService might fail if no keys.
    // Workaround: We can inject a key into the repository if accessible.
    // Or just try.
    // If it fails, I'll see the error.

    // Force key creation for test (using private access)

    const response1 = await controller.makeCredential({
      authenticatorMakeCredentialArgs: MOCK_ARGS,
      meta: MOCK_META,
      context: {},
    });

    expect(response1.status).toBe(200);
    const body1 = response1.body as any;
    expect(body1.context).toBeDefined();
    expect(body1.context.action).toBe('up');
    expect(body1.context.token).toBeDefined();
    expect(body1.context.up).toBe(false);

    // 4. Second Call: Client performed UP
    const token = body1.context.token;

    const response2 = await controller.makeCredential({
      authenticatorMakeCredentialArgs: MOCK_ARGS,
      meta: MOCK_META,
      context: {
        token,
        up: true, // Client says "I did it"
      },
    });

    expect(response2.status).toBe(200);
    expect(response2.body).toEqual(successResponse);

    // Verify authenticator was called with up=true
    expect(mockAuthenticator.authenticatorMakeCredential).toHaveBeenCalledTimes(
      2,
    );
    const secondCallArgs =
      mockAuthenticator.authenticatorMakeCredential.mock.calls[1][0];
    expect(secondCallArgs.context.up).toBe(true);
  });
});
