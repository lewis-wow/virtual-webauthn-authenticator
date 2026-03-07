import { describe, expect, test, vi } from 'vitest';

import type { AttestationHandler } from '../../../../src/attestationHandlers/AttestationHandler';
import { AttestationHandlerRegistry } from '../../../../src/attestationHandlers/AttestationHandlerRegistry';
import { AttestationProcessor } from '../../../../src/attestationHandlers/AttestationProcessor';

const createMockHandler = (
  format: string,
  result?: Map<string, unknown>,
): AttestationHandler => ({
  attestationFormat: format,
  createAttestation: vi.fn().mockResolvedValue(result ?? new Map()),
});

describe('AttestationProcessor', () => {
  test('delegates to the correct handler based on attestationFormat', async () => {
    const noneResult = new Map<string, unknown>();
    const noneHandler = createMockHandler('none', noneResult);
    const packedHandler = createMockHandler('packed');

    const registry = new AttestationHandlerRegistry().registerAll([
      noneHandler,
      packedHandler,
    ]);
    const processor = new AttestationProcessor(registry);

    const result = await processor.process({
      attestationFormat: 'none',
    });

    expect(result).toBe(noneResult);
    expect(noneHandler.createAttestation).toHaveBeenCalledOnce();
    expect(packedHandler.createAttestation).not.toHaveBeenCalled();
  });

  test('passes data to the handler', async () => {
    const handler = createMockHandler('packed');
    const registry = new AttestationHandlerRegistry().register(handler);
    const processor = new AttestationProcessor(registry);

    const data = {
      clientDataHash: new Uint8Array(),
      authData: new Uint8Array(),
    };
    await processor.process({
      attestationFormat: 'packed',
      data,
    });

    expect(handler.createAttestation).toHaveBeenCalledWith(data);
  });

  test('throws when attestationFormat is not registered', async () => {
    const registry = new AttestationHandlerRegistry();
    const processor = new AttestationProcessor(registry);

    await expect(
      processor.process({ attestationFormat: 'unknown' }),
    ).rejects.toThrow('Unsupported attestation format is used.');
  });
});
