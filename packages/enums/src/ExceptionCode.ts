import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const ExceptionCode = {
  VIRTUAL_AUTHENTICATOR_ATTESTATION_NOT_SUPPORTED:
    'VIRTUAL_AUTHENTICATOR_ATTESTATION_NOT_SUPPORTED',
  VIRTUAL_AUTHENTICATOR_CREDENTIAL_NOT_FOUND:
    'VIRTUAL_AUTHENTICATOR_CREDENTIAL_NOT_FOUND',
} as const;

export type ExceptionCode = ValueOfEnum<typeof ExceptionCode>;

export const ExceptionCodeSchema = z.enum(ExceptionCode).meta({
  description: 'Exception Code',
  examples: [ExceptionCode.VIRTUAL_AUTHENTICATOR_ATTESTATION_NOT_SUPPORTED],
});
