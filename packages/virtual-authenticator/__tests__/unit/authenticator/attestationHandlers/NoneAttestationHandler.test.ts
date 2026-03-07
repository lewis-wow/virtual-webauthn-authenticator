import { describe, expect, test } from 'vitest';

import { NoneAttestationHandler } from '../../../../src/attestationHandlers/NoneAttestationHandler';
import { Fmt } from '../../../../src/enums/Fmt';

describe('NoneAttestationHandler', () => {
  const handler = new NoneAttestationHandler();

  test('attestationFormat is Fmt.NONE', () => {
    expect(handler.attestationFormat).toBe(Fmt.NONE);
  });

  test('createAttestation returns an empty Map', async () => {
    const result = await handler.createAttestation();

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });
});
